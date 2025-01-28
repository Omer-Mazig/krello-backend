import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardMembersService } from 'src/board-members/board-members.service';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import {
  BOARD_PERMISSION_MATRIX,
  WORKSPACE_PERMISSION_MATRIX,
} from './permissions-matrix';

type WorkspaceAction = keyof typeof WORKSPACE_PERMISSION_MATRIX;
type BoardAction = keyof typeof BOARD_PERMISSION_MATRIX;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private boardMembersService: BoardMembersService,
    private workspaceMembersService: WorkspaceMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const boardId = request.params.boardId;
    const workspaceId = request.params.workspaceId;
    const action = this.reflector.get<string>('action', context.getHandler());

    if (!action) {
      throw new ForbiddenException('Invalid request.');
    }

    if (workspaceId) {
      const workspaceMember =
        await this.workspaceMembersService.findOneByWorkspaceAndUser(
          workspaceId,
          user.sub,
        );
      if (!workspaceMember)
        throw new ForbiddenException('You are not a member of this workspace.');

      return this.validateWorkspacePermission(
        workspaceMember,
        action as WorkspaceAction,
        user.sub,
      );
    }

    if (boardId) {
      const boardMember = await this.boardMembersService.findOneByBoardAndUser(
        boardId,
        user.sub,
      );
      if (!boardMember)
        throw new ForbiddenException('You are not a member of this board.');

      return this.validateBoardPermission(
        boardMember,
        action as BoardAction,
        user.sub,
      );
    }

    throw new ForbiddenException('Invalid request context.');
  }

  private validateWorkspacePermission(
    member: WorkspaceMember,
    action: WorkspaceAction,
    userId: string,
  ): boolean {
    const allowedRoles = WORKSPACE_PERMISSION_MATRIX[action] || [];

    // Check if the member's role is allowed for the action
    if (allowedRoles.includes(member.role)) {
      return true;
    }

    // Allow users to remove themselves from the workspace
    if (action === 'removeMember' && member.user.id === userId) {
      return true; // User is allowed to leave the workspace
    }

    throw new ForbiddenException(
      'You do not have permission for this workspace action.',
    );
  }

  private validateBoardPermission(
    member: BoardMember,
    action: BoardAction,
    userId: string,
  ): boolean {
    const visibility = member.board.visibility; // `private`, `workspace`, or `public`

    let allowedRoles = BOARD_PERMISSION_MATRIX[action];
    if (!Array.isArray(allowedRoles)) {
      allowedRoles = allowedRoles[visibility];
    }

    if (action === 'edit' || action === 'view') {
      const visibilityRoles = BOARD_PERMISSION_MATRIX[action][visibility] || [];
      if (
        visibilityRoles.includes(member.role) ||
        (visibility === 'public' && visibilityRoles.includes('anyone'))
      ) {
        return true;
      }
    } else if (allowedRoles.includes(member.role)) {
      return true;
    }

    if (action === 'removeMember' && member.user.id === userId) {
      return true; // User is allowed to leave the board
    }

    throw new ForbiddenException(
      'You do not have permission for this board action.',
    );
  }
}
