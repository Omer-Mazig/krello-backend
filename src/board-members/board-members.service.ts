import { Injectable } from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { BoardMember } from './entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
    private readonly boardsService: BoardsService,
  ) {}

  create(createBoardMemberDto: CreateBoardMemberDto) {
    try {
      const board = this.boardsService.findOneWithRelations(
        createBoardMemberDto.boardId,
        'members',
      );
    } catch (error) {
      console.error(`Error adding board member`, error);
      throw error;
    }
  }
}
