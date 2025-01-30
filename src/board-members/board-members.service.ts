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
import { Board } from 'src/boards/entities/board.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
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

      // Check if user is already a board member
      const existingMember = await this.boardMembersRepository.findOne({
        where: {
          board: { id: boardId },
          user: { id: userId },
        },
        relations: { board: { workspace: true } },
      });

      if (existingMember) {
        throw new BadRequestException('User is already a member of this board');
      }

      const board = await this.boardRepository.findOne({
        where: { id: boardId },
        relations: { workspace: true },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      // Check if user is a workspace member
      const workspaceMember = await this.workspaceMembersRepository.findOne({
        where: {
          workspace: { id: board.workspace.id },
          user: { id: userId },
        },
      });

      if (!workspaceMember) {
        throw new BadRequestException(
          'User must be a member of the workspace to join this board',
        );
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

  async update(memberId: string, updateBoardMemberDto: UpdateBoardMemberDto) {
    const member = await this.findOneWithRelations(memberId, {
      board: true,
    });

    const { role } = updateBoardMemberDto;

    if (role) {
      member.role = role;
    }

    return await this.boardMembersRepository.save(member);
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
