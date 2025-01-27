import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { BoardMember } from './entities/board-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
  ) {}

  async create(
    createBoardMemberDto: CreateBoardMemberDto,
  ): Promise<BoardMember> {
    try {
      const { boardId, userId } = createBoardMemberDto;
      const existingMember = await this.boardMembersRepository.findOne({
        where: {
          board: { id: boardId },
          user: { id: userId },
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }

      const newMember = this.boardMembersRepository.create({
        board: { id: boardId },
        user: { id: userId },
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
