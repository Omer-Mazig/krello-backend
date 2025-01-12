import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityType } from '../enums/activity-type.enum';
import { ActivityPayloadMap } from '../types/activity-payload.type';
import { BOARD_ADDED } from 'src/events/board.event';
import { CARD_ADDED } from 'src/events/card.event';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  @OnEvent(BOARD_ADDED)
  async handleAddingBoardEvent(
    payload: ActivityPayloadMap[ActivityType.BOARD_ADDED],
  ) {
    await this.activityService.createActivity<
      ActivityPayloadMap[ActivityType.BOARD_ADDED]
    >(payload);
  }

  @OnEvent(CARD_ADDED)
  async handleAddingCardEvent(
    payload: ActivityPayloadMap[ActivityType.CARD_ADDED],
  ) {
    await this.activityService.createActivity<
      ActivityPayloadMap[ActivityType.CARD_ADDED]
    >(payload);
  }
}
