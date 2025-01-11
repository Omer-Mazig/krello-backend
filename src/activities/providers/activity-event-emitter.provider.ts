import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityPayloadMap } from '../types/activity-payload.type';

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
