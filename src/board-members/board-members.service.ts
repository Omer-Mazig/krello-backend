import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { BoardMember } from './entities/board-member.entity';
import { BoardsService } from 'src/boards/boards.service';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
    private readonly boardsService: BoardsService,
  ) {}

  async create(createBoardMemberDto: CreateBoardMemberDto) {
    try {
      const existingMember = await this.boardMembersRepository.findOne({
        where: {
          board: { id: createBoardMemberDto.boardId },
          user: { id: createBoardMemberDto.userId },
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }

      const newMember = this.boardMembersRepository.create({
        board: { id: createBoardMemberDto.boardId },
        user: { id: createBoardMemberDto.userId },
      });

      return await this.boardMembersRepository.save(newMember);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        console.error(`Error adding workspace member`, error);
        throw new BadRequestException('Invalid user or workspace ID');
      }
      console.error(`Error adding workspace member`, error);
      throw error;
    }
  }
}
