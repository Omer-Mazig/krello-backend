import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityType } from '../enums/activity-type.enum';
import { ActivityPayloadMap } from '../types/activity-payload.type';
import { BOARD_ADDED, CARD_ADDED } from 'src/events/event.constants';
import { Activity } from '../entities/activity.entity';
import { DeepPartial } from 'typeorm';

/**
 * Handles activity events and delegates actions to the `ActivitiesService`.
 *
 * This listener is designed to handle multiple actions based on the same event,
 * providing flexibility for event-driven workflows.
 */
@Injectable()
export class ActivityListener {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @OnEvent(BOARD_ADDED)
  handleAddingBoardEvent(
    payload: ActivityPayloadMap[ActivityType.BOARD_ADDED],
  ) {
    // Preprocess the payload
    const processedPayload: DeepPartial<Activity> = {
      ...payload,
      user: { id: payload.userId },
      sourceBoard: { id: payload.sourceBoardId },
      // baba: 'baba', // this will error
    };

    this.activitiesService.createActivity(processedPayload);
  }
}
