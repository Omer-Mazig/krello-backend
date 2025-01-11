import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { DataSource, Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly dataSource: DataSource,
  ) {}

  private readonly RELATION_MAP = {
    members: ['members', 'members.user'],
    lists: ['lists', 'lists.cards'],
    all: ['members', 'members.user', 'lists', 'lists.cards', 'labels'],
  };

  async create({ name }: CreateBoardDto, userId: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const newBoard = manager.getRepository(Board).create({ name });
        await manager.getRepository(Board).save(newBoard);

        const boardMember = manager.getRepository(BoardMember).create({
          board: newBoard,
          user: { id: userId },
          role: 'super_admin',
        });
        await manager.getRepository(BoardMember).save(boardMember);

        return manager.getRepository(Board).findOne({
          where: { id: newBoard.id },
          relations: ['members'],
        });
      });
    } catch (error) {
      console.error('Error creating board:', error);
      throw new InternalServerErrorException(
        'Failed to create board. Please try again later.',
      );
    }
  }

  async findAll() {
    try {
      const boards = await this.boardRepository.find();

      if (!boards) {
        throw new NotFoundException('No boards found.');
      }

      return boards;
    } catch (error) {
      console.error('Error finding boards:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to find boards. Please try again later.',
      );
    }
  }

  /**
   * Fetch a board with specific relations.
   * @param boardId - The ID of the board to fetch.
   * @param relationKey - Key from the RELATION_MAP to specify relations to load.
   * @returns The board with the specified relations.
   */
  async findBoardWithRelations(
    boardId: string,
    relationKey: keyof typeof this.RELATION_MAP = 'all', // Default to 'all'
  ): Promise<Board> {
    const relations = this.RELATION_MAP[relationKey];

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations,
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found.`);
    }

    return board;
  }

  async remove(boardId: string): Promise<void> {
    try {
      const board = await this.boardRepository.findOne({
        where: { id: boardId },
      });

      if (!board) {
        throw new NotFoundException(`Board with ID ${boardId} not found.`);
      }

      await this.boardRepository.remove(board);
    } catch (error) {
      console.error('Error removing board:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to remove the board. Please try again later.',
      );
    }
  }
}
