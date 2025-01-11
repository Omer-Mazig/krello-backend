import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityEvent } from '../enums/activity-event.enum';
import { CardAddedActivityPayload } from '../types/activity-payload.type';

/**
 * this provider will be useful when we have more than one actions base on the same event
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  @OnEvent(ActivityEvent.CARD_ADDED)
  async handleAddingCardEvent(payload: CardAddedActivityPayload) {
    await this.activityService.createActivity<CardAddedActivityPayload>(
      payload,
    );
  }
}
