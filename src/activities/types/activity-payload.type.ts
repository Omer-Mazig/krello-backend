import { ActivityEvent } from '../enums/activity-event.enum';

// Define the mapping of activity events to payload types
export type ActivityPayloadMap = {
  [ActivityEvent.LIST_ADDED]: ListAddedActivityPayload;
  [ActivityEvent.CARD_ADDED]: CardAddedActivityPayload;
  [ActivityEvent.BOARD_ADDED]: BoardAddedActivityPayload;
};

// Type-level enforcement to ensure the payload type matches the `type` field in the payload
type VerifyPayloadTypes<T extends Record<ActivityEvent, unknown>> = {
  [K in keyof T]: T[K] extends { type: K } ? true : never;
};

// If there is a mismatch, this will cause a TypeScript error
type PayloadTypeValidation = VerifyPayloadTypes<ActivityPayloadMap>;
const _payloadTypeValidation: PayloadTypeValidation = {
  [ActivityEvent.LIST_ADDED]: true,
  [ActivityEvent.CARD_ADDED]: true,
  [ActivityEvent.BOARD_ADDED]: true,
};

// Define the payload types for each activity event
type BoardAddedActivityPayload = {
  type: ActivityEvent.BOARD_ADDED;
  userId: string;
  sourceBoardId: string;
};

type ListAddedActivityPayload = {
  type: ActivityEvent.LIST_ADDED;
  userId: string;
  sourceBoardId: string;
};

type CardAddedActivityPayload = {
  type: ActivityEvent.CARD_ADDED;
  userId: string;
  sourceBoardId: string;
  cardId: string;
  sourceListTitle: string;
};
