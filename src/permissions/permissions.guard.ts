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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<
      BoardAction | WorkspaceAction
    >('requires-permission', context.getHandler());

    if (!requiredPermission) {
      console.log('no permission required');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      return false;
    }

    // WORKSPACE PERMISSIONS CHECK
    if (WORKSPACE_PERMISSION_MATRIX[requiredPermission as WorkspaceAction]) {
      // Get workspace ID from request params or body
      const workspaceId =
        request.params.workspaceId || request.body.workspaceId;
      if (!workspaceId) return false;

      // Find the user's membership in the workspace
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          user: { id: userId },
          workspace: { id: workspaceId },
        },
        relations: ['workspace'],
      });

      if (!workspaceMember) return false;

      // For removeWorkspace action, ensure the user is an admin of this specific workspace
      if (requiredPermission === 'removeWorkspace') {
        return workspaceMember.role === 'admin';
      }

      // For other workspace actions, check against the permission matrix
      return WORKSPACE_PERMISSION_MATRIX[
        requiredPermission as WorkspaceAction
      ].includes(workspaceMember.role);
    }

    // BOARD PERMISSIONS CHECK
    if (BOARD_PERMISSION_MATRIX[requiredPermission as BoardAction]) {
      // Get board ID from request params or body
      const boardId = request.params.boardId || request.body.boardId;
      if (!boardId) return false;

      // Find the board and its associated workspace
      const board = await this.boardRepository.findOne({
        where: { id: boardId },
        relations: ['workspace'],
      });

      if (!board) return false;

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

      // Handle visibility-based permissions (public/workspace/private)
      if (typeof permission === 'object') {
        // Check public board access
        if (
          board.visibility === 'public' &&
          ('public' in permission
            ? permission.public.includes('anyone')
            : false)
        ) {
          return true;
        }

        // Check workspace-level access for workspace-visible boards
        if (
          board.visibility === 'workspace' &&
          workspaceMember &&
          ('workspace' in permission
            ? permission.workspace.includes(workspaceMember.role)
            : false)
        ) {
          return true;
        }

        // Check private board access
        return Boolean(
          boardMember &&
            ('private' in permission
              ? permission.private.includes(boardMember.role)
              : false),
        );
      }

      // Handle regular board permissions (non-visibility based)
      return Boolean(
        boardMember &&
          (Array.isArray(permission)
            ? (permission as string[]).includes(boardMember.role)
            : false),
      );
    }

    // If no permission rules match, deny access
    return false;
  }
}
