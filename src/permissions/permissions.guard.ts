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

    // If no permission is required, allow access
    if (!requiredPermission) {
      this.logPermissionCheck(userId || 'anonymous', null, {}, true);
      return true;
    }

    // Block anonymous users
    if (!userId) {
      this.logPermissionCheck('anonymous', requiredPermission, {}, false);
      return false;
    }

    // Handle workspace-level permissions
    if (WORKSPACE_PERMISSION_MATRIX[requiredPermission as WorkspaceAction]) {
      return this.handleWorkspacePermission(
        requiredPermission as WorkspaceAction,
        request,
        userId,
      );
    }

    // Handle board-level permissions
    if (BOARD_PERMISSION_MATRIX[requiredPermission as BoardAction]) {
      return this.handleBoardPermission(
        requiredPermission as BoardAction,
        request,
        userId,
      );
    }

    this.logPermissionCheck(userId, requiredPermission, {}, false);
    return false;
  }

  private async handleWorkspacePermission(
    requiredPermission: WorkspaceAction,
    request: any,
    userId: string,
  ): Promise<boolean> {
    const workspaceId = request.params.workspaceId || request.body.workspaceId;
    const targetMemberId = request.params.memberId;

    if (!workspaceId) {
      this.logPermissionCheck(
        userId,
        requiredPermission,
        { workspaceId: 'missing' },
        false,
      );
      return false;
    }

    const workspaceMember = await this.getWorkspaceMember(userId, workspaceId);
    if (!workspaceMember) {
      this.logPermissionCheck(
        userId,
        requiredPermission,
        { workspaceId, memberRole: 'none' },
        false,
      );
      return false;
    }

    let isGranted = WORKSPACE_PERMISSION_MATRIX[requiredPermission].includes(
      workspaceMember.role,
    );

    // Allow members to remove themselves from workspace
    if (
      requiredPermission === 'removeWorkspaceMember' &&
      targetMemberId &&
      workspaceMember.user.id === userId &&
      targetMemberId === workspaceMember.id
    ) {
      isGranted = true;
    }

    this.logPermissionCheck(
      userId,
      requiredPermission,
      { workspaceId, memberRole: workspaceMember.role },
      isGranted,
    );
    return isGranted;
  }

  private async handleBoardPermission(
    requiredPermission: BoardAction,
    request: any,
    userId: string,
  ): Promise<boolean> {
    const boardId = request.params.boardId || request.body.boardId;
    const targetMemberId = request.params.memberId;

    if (!boardId) {
      this.logPermissionCheck(
        userId,
        requiredPermission,
        { boardId: 'missing' },
        false,
      );
      return false;
    }

    const board = await this.getBoard(boardId);
    if (!board) {
      this.logPermissionCheck(
        userId,
        requiredPermission,
        { boardId, error: 'board not found' },
        false,
      );
      return false;
    }

    const [boardMember, workspaceMember, targetBoardMember] =
      await this.getMemberships(
        userId,
        boardId,
        board.workspace.id,
        targetMemberId,
      );

    const isGranted = await this.checkBoardPermission(
      requiredPermission,
      board,
      boardMember,
      workspaceMember,
      targetBoardMember,
      userId,
      targetMemberId,
    );

    this.logPermissionCheck(
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

  // Helper methods
  private async getWorkspaceMember(userId: string, workspaceId: string) {
    return this.workspaceMemberRepository.findOne({
      where: { user: { id: userId }, workspace: { id: workspaceId } },
      relations: ['workspace', 'user'],
    });
  }

  private async getBoard(boardId: string) {
    return this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['workspace'],
    });
  }

  private async getMemberships(
    userId: string,
    boardId: string,
    workspaceId: string,
    targetMemberId?: string,
  ) {
    return Promise.all([
      this.boardMemberRepository.findOne({
        where: { user: { id: userId }, board: { id: boardId } },
        relations: { user: true },
      }),
      this.workspaceMemberRepository.findOne({
        where: { user: { id: userId }, workspace: { id: workspaceId } },
      }),
      targetMemberId
        ? this.boardMemberRepository.findOne({
            where: { id: targetMemberId },
            relations: { user: true },
          })
        : null,
    ]);
  }

  private async checkBoardPermission(
    requiredPermission: BoardAction,
    board: Board,
    boardMember: BoardMember | null,
    workspaceMember: WorkspaceMember | null,
    targetBoardMember: BoardMember | null,
    userId: string,
    targetMemberId?: string,
  ): Promise<boolean> {
    const permission = BOARD_PERMISSION_MATRIX[requiredPermission];
    let isGranted = false;

    if (typeof permission === 'object') {
      // Actions that always require board membership
      const requiresBoardMembership = ['createBoardMember'].includes(
        requiredPermission,
      );

      // Check public board access
      if (
        board.visibility === 'public' &&
        permission.public.includes('anyone') &&
        !requiresBoardMembership
      ) {
        isGranted = true;
      }

      // Check workspace-level access for all board visibilities
      if (workspaceMember) {
        const workspacePrefix = 'workspace:';
        const workspaceRoles = permission[board.visibility]
          .filter((role) => role.startsWith(workspacePrefix))
          .map((role) => role.substring(workspacePrefix.length));

        if (workspaceRoles.includes(workspaceMember.role)) {
          isGranted = true;
        }
      }

      // Check board-level access
      if (boardMember) {
        const boardRoles = permission[board.visibility].filter(
          (role) => !role.startsWith('workspace:'),
        );
        if (boardRoles.includes(boardMember.role)) {
          isGranted = true;
        }
      }

      // Special case for self-removal
      if (
        requiredPermission === 'removeBoardMember' &&
        targetBoardMember &&
        targetBoardMember.user.id === userId &&
        targetBoardMember.id === targetMemberId
      ) {
        isGranted = true;
      }
    }

    return isGranted;
  }

  private logPermissionCheck(
    userId: string,
    permission: BoardAction | WorkspaceAction | null,
    context: any,
    isGranted: boolean,
  ) {
    this.permissionsLogger.logPermissionCheck(
      userId,
      permission,
      context,
      isGranted,
    );
  }
}
