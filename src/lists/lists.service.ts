import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEventEmitter } from 'src/activities/providers/activity-event-emitter.provider';
import { ActivityEvent } from 'src/activities/enums/activity-event.enum';
import { AddListActivityPayload } from 'src/activities/types/activity-payload.type';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    private readonly activityEventEmitter: ActivityEventEmitter,
  ) {}

  async create(
    { title, boardId, position }: CreateListDto,
    userId: string,
  ): Promise<List> {
    const newList = this.listRepository.create({
      title,
      board: { id: boardId },
      position,
    });
    const savedList = await this.listRepository.save(newList);

    // Trigger ADDING_CARD event
    this.activityEventEmitter.emitActivity(ActivityEvent.LIST_ADDED, {
      type: ActivityEvent.LIST_ADDED,
      userId,
      sourceBoardId: savedList.board.id,
    });

    return savedList;
  }
}
