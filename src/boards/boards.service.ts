import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { DataSource, Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { ActivityType } from 'src/activities/enums/activity-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_BOARD_ADDED } from 'src/constants/event.constants';
import { ActivityPayloadMap } from 'src/activities/types/activity-payload copyy.type';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly RELATION_MAP = {
    // Fetch board members and their associated users
    members: ['members', 'members.user'],

    // Fetch lists only (not their cards)
    lists: ['lists'],

    // Fetch lists with their nested cards
    listsWithCards: ['lists', 'lists.cards'],

    // Fetch cards directly linked to the board (ungrouped)
    cards: ['cards'],

    // Fetch labels associated with the board
    labels: ['labels'],

    // Fetch everything related to cards (including members and labels)
    cardsWithDetails: ['cards', 'cards.members', 'cards.labels'],

    // Fetch everything related to lists, including nested cards and their details
    listsWithCardsAndDetails: [
      'lists',
      'lists.cards',
      'lists.cards.members',
      'lists.cards.labels',
    ],

    // Fetch everything related to the board
    all: [
      'members',
      'members.user',
      'lists',
      'lists.cards',
      'lists.cards.members',
      'lists.cards.labels',
      'cards',
      'labels',
    ],
  };

  async create({ name }: CreateBoardDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    // Connect the query runner to a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create the board
      const newBoard = queryRunner.manager
        .getRepository(Board)
        .create({ name });
      await queryRunner.manager.getRepository(Board).save(newBoard);

      // Step 2: Create the board member
      const boardMember = queryRunner.manager
        .getRepository(BoardMember)
        .create({
          board: newBoard,
          user: { id: userId },
          role: 'super_admin',
        });
      await queryRunner.manager.getRepository(BoardMember).save(boardMember);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Step 3: Fetch and return the board with its members
      const boardToReturn = this.findOneWithRelations(newBoard.id);

      this.eventEmitter.emit(EVENT_BOARD_ADDED, {
        type: ActivityType.BOARD_ADDED,
        user: userId,
        sourceBoard: newBoard.id,
      } satisfies ActivityPayloadMap[ActivityType.BOARD_ADDED]);

      return boardToReturn;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error creating board:', error);
      throw new InternalServerErrorException(
        'Failed to create board. Please try again later.',
      );
    } finally {
      // Release the query runner
      await queryRunner.release();
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
  async findOneWithRelations(
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
