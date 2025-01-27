import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    // TODO: do i really need boardId?
    const boardId = request.params?.boardId || request.body?.boardId;

    if (!boardId || !user.sub) {
      throw new ForbiddenException('Board ID and User ID are required');
    }

    const member = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: user.sub },
      },
      relations: {
        user: true,
        board: true,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You must be a board member to perform this action',
      );
    }

    return true;
  }
}
