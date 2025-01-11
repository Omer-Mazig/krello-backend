import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityEvent } from '../enums/activity-event.enum';
import { ActivityPayloadMap } from '../types/activity-payload.type';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  @OnEvent(ActivityEvent.CARD_ADDED)
  async handleAddingCardEvent(
    payload: ActivityPayloadMap[ActivityEvent.CARD_ADDED],
  ) {
    await this.activityService.createActivity<
      ActivityPayloadMap[ActivityEvent.CARD_ADDED]
    >(payload);
  }
}
