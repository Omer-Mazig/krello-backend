import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly eventEmitter: EventEmitter2,
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

    return savedCard;
  }
}
