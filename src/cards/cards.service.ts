import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { ActivityService } from 'src/activities/activities.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly activityService: ActivityService,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string): Promise<Card> {
    const card = this.cardRepository.create({
      title: createCardDto.title,
      position: createCardDto.position,
      list: { id: createCardDto.listId }, // Assign the List ID
      board: { id: createCardDto.boardId }, // Assign the Board ID
    });

    const savedCard = await this.cardRepository.save(card);

    await this.activityService.logActivity(
      'ADD_CARD',
      {
        user: { id: userId, name: `User ${userId}` },
        card: { id: savedCard.id, name: savedCard.title },
      },
      {
        user: userId,
        card: savedCard.id,
        list: createCardDto.listId,
        board: createCardDto.boardId,
      },
    );

    return savedCard;
  }
}
