import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { ActivityEventEmitter } from 'src/activities/providers/activity-event-emitter.provider';
import { ActivityEvent } from 'src/activities/enums/activity-event.enum';
import { AddCardActivityPayload } from 'src/activities/types/activity-payload.type';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly activityEventEmitter: ActivityEventEmitter,
  ) {}

  async addCard(
    title: string,
    listId: string,
    boardId: string,
    userId: string,
  ): Promise<Card> {
    const newCard = this.cardRepository.create({
      title,
      list: { id: listId },
      board: { id: boardId },
    });
    const savedCard = await this.cardRepository.save(newCard);

    // Trigger ADDING_CARD event
    this.activityEventEmitter.emitActivity<AddCardActivityPayload>(
      ActivityEvent.ADDING_CARD,
      {
        type: ActivityEvent.ADDING_CARD,
        userId,
        boardId: savedCard.board.id,
        cardId: savedCard.id,
        listName: savedCard.list.name,
      },
    );

    return savedCard;
  }
}
