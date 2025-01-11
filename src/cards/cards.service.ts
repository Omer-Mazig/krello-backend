import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { ActivityEventEmitter } from 'src/activities/providers/activity-event-emitter.provider';
import { ActivityEvent } from 'src/activities/enums/activity-event.enum';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly activityEventEmitter: ActivityEventEmitter,
  ) {}

  async create(
    { title, listId, boardId, position }: CreateCardDto,
    userId: string,
  ): Promise<Card> {
    const newCard = this.cardRepository.create({
      title,
      list: { id: listId },
      board: { id: boardId },
      position,
    });
    const savedCard = await this.cardRepository.save(newCard);

    // Trigger ADDING_CARD event
    this.activityEventEmitter.emitActivity(ActivityEvent.CARD_ADDED, {
      type: ActivityEvent.CARD_ADDED,
      userId,
      sourceBoardId: savedCard.board.id,
      cardId: savedCard.id,
      sourceListTitle: savedCard.list.title,
    });

    return savedCard;
  }
}
