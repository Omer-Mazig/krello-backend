import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { BoardMember } from './entities/board-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { MembershipManagerProvider } from 'src/membership-management/providers/membership-manager-provider';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
    private readonly membershipManager: MembershipManagerProvider,
    private readonly dataSource: DataSource,
  ) {}

  async findOneByBoardAndUser(
    boardId: string,
    userId: string,
  ): Promise<BoardMember | null> {
    return this.boardMembersRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
      relations: ['board', 'board.workspace'],
    });
  }

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
        throw new BadRequestException('User is already a member of this board');
      }

      const newMember = this.boardMembersRepository.create({
        board: { id: boardId },
        user: { id: userId },
      });

      return await this.boardMembersRepository.save(newMember);
    } catch (error) {
      console.error(`Error adding board member`, error);
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid user or board ID');
      }
      throw error;
    }
  }

  async findOneWithRelations(
    memberId: string,
    relations: FindOptionsRelations<BoardMember>,
  ) {
    try {
      const member = await this.boardMembersRepository.findOne({
        where: { id: memberId },
        relations,
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      return member;
    } catch (error) {
      console.error(`Error finding board member`, error);
      throw error;
    }
  }

  async remove(memberId: string): Promise<void> {
    const member = await this.findOneWithRelations(memberId, {
      board: true,
    });

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.membershipManager.handleBoardMembers(queryRunner, member);

      await queryRunner.manager.getRepository(BoardMember).remove(member);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
