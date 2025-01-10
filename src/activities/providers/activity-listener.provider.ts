import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivitiesService } from '../activities.service';
import { ActivityEvent } from '../enums/activity-event.enum';
import { AddCardActivityPayload } from '../types/activity-payload.type';

// TODO: maybe can remove it ???
@Injectable()
export class ActivityListener {
  constructor(private readonly activityService: ActivitiesService) {}

  @OnEvent(ActivityEvent.ADDING_CARD)
  async handleAddingCardEvent(payload: AddCardActivityPayload) {
    await this.activityService.createActivity<AddCardActivityPayload>(payload);
  }
}
