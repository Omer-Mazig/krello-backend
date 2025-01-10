import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityEvent } from '../enums/activity-event.enum';
import { AddCardActivityPayload } from '../types/activity-payload.type';

@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  @OnEvent(ActivityEvent.ADDING_CARD)
  async handleAddingCardEvent(payload: AddCardActivityPayload) {
    await this.activityService.createActivity<AddCardActivityPayload>({
      type: ActivityEvent.ADDING_CARD,
      userId: payload.userId,
      cardId: payload.cardId,
      boardId: payload.boardId,
      listName: payload.listName,
    } satisfies AddCardActivityPayload);
  }
}
