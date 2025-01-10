import { Injectable } from '@nestjs/common';
import { ActivityEvent } from '../enums/activity-event.enum';
import {
  AddCardActivityPayload,
  AddListActivityPayload,
} from '../types/activity-payload.type';
import { EventEmitter2 } from '@nestjs/event-emitter';

type ActivityPayloadMap = {
  [ActivityEvent.CARD_ADDED]: AddCardActivityPayload;
  [ActivityEvent.LIST_ADDED]: AddListActivityPayload;
  // Add other mappings as needed
};

@Injectable()
export class ActivityEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitActivity<K extends keyof ActivityPayloadMap>(
    eventName: K,
    payload: ActivityPayloadMap[K],
  ) {
    this.eventEmitter.emit(eventName, payload);
  }
}
