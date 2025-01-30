import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  BOARD_PERMISSION_MATRIX,
  WORKSPACE_PERMISSION_MATRIX,
} from './permissions-matrix';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import {
  BoardAction,
  WorkspaceAction,
} from './decorators/requires-permission.decorator';
import { PermissionsLogger } from './permissions.logger';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private permissionsLogger: PermissionsLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<
      BoardAction | WorkspaceAction
    >('requires-permission', context.getHandler());

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!requiredPermission) {
      this.permissionsLogger.logPermissionCheck(
        userId || 'anonymous',
        null,
        {},
        true,
      );
      return true;
    }

    if (!userId) {
      this.permissionsLogger.logPermissionCheck(
        'anonymous',
        requiredPermission,
        {},
        false,
      );
      return false;
    }

    // WORKSPACE PERMISSIONS CHECK
    if (WORKSPACE_PERMISSION_MATRIX[requiredPermission as WorkspaceAction]) {
      const workspaceId =
        request.params.workspaceId || request.body.workspaceId;
      if (!workspaceId) {
        this.permissionsLogger.logPermissionCheck(
          userId,
          requiredPermission,
          { workspaceId: 'missing' },
          false,
        );
        return false;
      }

      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          user: { id: userId },
          workspace: { id: workspaceId },
        },
        relations: ['workspace'],
      });

      if (!workspaceMember) {
        this.permissionsLogger.logPermissionCheck(
          userId,
          requiredPermission,
          { workspaceId, memberRole: 'none' },
          false,
        );
        return false;
      }

      const isGranted =
        requiredPermission === 'removeWorkspace'
          ? workspaceMember.role === 'admin'
          : WORKSPACE_PERMISSION_MATRIX[
              requiredPermission as WorkspaceAction
            ].includes(workspaceMember.role);

      this.permissionsLogger.logPermissionCheck(
        userId,
        requiredPermission,
        { workspaceId, memberRole: workspaceMember.role },
        isGranted,
      );

      return isGranted;
    }

    // BOARD PERMISSIONS CHECK
    if (BOARD_PERMISSION_MATRIX[requiredPermission as BoardAction]) {
      const boardId = request.params.boardId || request.body.boardId;
      if (!boardId) {
        this.permissionsLogger.logPermissionCheck(
          userId,
          requiredPermission,
          { boardId: 'missing' },
          false,
        );
        return false;
      }

      const board = await this.boardRepository.findOne({
        where: { id: boardId },
        relations: ['workspace'],
      });

      if (!board) {
        this.permissionsLogger.logPermissionCheck(
          userId,
          requiredPermission,
          { boardId, error: 'board not found' },
          false,
        );
        return false;
      }

      // Get both board and workspace membership for the user
      const [boardMember, workspaceMember] = await Promise.all([
        this.boardMemberRepository.findOne({
          where: {
            user: { id: userId },
            board: { id: boardId },
          },
        }),
        this.workspaceMemberRepository.findOne({
          where: {
            user: { id: userId },
            workspace: { id: board.workspace.id },
          },
        }),
      ]);

      const permission =
        BOARD_PERMISSION_MATRIX[requiredPermission as BoardAction];
      let isGranted = false;

      if (typeof permission === 'object') {
        if (
          board.visibility === 'public' &&
          ('public' in permission
            ? permission.public.includes('anyone')
            : false)
        ) {
          isGranted = true;
        } else if (board.visibility === 'workspace' && workspaceMember) {
          const workspaceRoles = permission.workspace.map((role) =>
            role.startsWith('workspace:')
              ? role.replace('workspace:', '')
              : role,
          );
          if (workspaceRoles.includes(workspaceMember.role)) {
            isGranted = true;
          }
        } else if (boardMember) {
          const boardRoles = permission.private.filter(
            (role) => !role.startsWith('workspace:'),
          );
          if (boardRoles.includes(boardMember.role)) {
            isGranted = true;
          }
        }
      } else {
        isGranted = Boolean(
          boardMember &&
            (Array.isArray(permission)
              ? (permission as string[]).includes(boardMember.role)
              : false),
        );
      }

      this.permissionsLogger.logPermissionCheck(
        userId,
        requiredPermission,
        {
          boardId,
          workspaceId: board.workspace.id,
          visibility: board.visibility,
          memberRole: boardMember?.role || 'none',
          workspaceRole: workspaceMember?.role || 'none',
        },
        isGranted,
      );

      return isGranted;
    }

    this.permissionsLogger.logPermissionCheck(
      userId,
      requiredPermission,
      {},
      false,
    );
    return false;
  }
}
