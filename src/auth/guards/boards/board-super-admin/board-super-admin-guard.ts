import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BoardsService } from 'src/boards/boards.service';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class BoardSuperAdminGuard implements CanActivate {
  constructor(private readonly boardsService: BoardsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('BoardSuperAdminGuard executed');
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    const boardId = request.params.id;

    const board = await this.boardsService.findOneWithRelations(
      boardId,
      'members',
    );

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found.`);
    }

    const isSuperAdmin = board.members.some(
      (member) => member.user.id === user.sub && member.role === 'super_admin',
    );

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    }

    return true;
  }
}
