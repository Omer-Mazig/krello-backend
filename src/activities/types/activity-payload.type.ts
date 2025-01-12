import { ActivityType } from '../enums/activity-type.enum';

// Define the mapping of activity events to payload types
export type ActivityPayloadMap = {
  [ActivityType.LIST_ADDED]: ListAddedActivityPayload;
  [ActivityType.CARD_ADDED]: CardAddedActivityPayload;
  [ActivityType.BOARD_ADDED]: BoardAddedActivityPayload;
};

// Type-level enforcement to ensure the payload type matches the `type` field in the payload
type VerifyPayloadTypes<T extends Record<ActivityType, unknown>> = {
  [K in keyof T]: T[K] extends { type: K } ? true : never;
};

// If there is a mismatch, this will cause a TypeScript error
type PayloadTypeValidation = VerifyPayloadTypes<ActivityPayloadMap>;
const _payloadTypeValidation: PayloadTypeValidation = {
  [ActivityType.LIST_ADDED]: true,
  [ActivityType.CARD_ADDED]: true,
  [ActivityType.BOARD_ADDED]: true,
};

// Define the payload types for each activity event
type BoardAddedActivityPayload = {
  type: ActivityType.BOARD_ADDED;
  user: string;
  sourceBoard: string;
};

type ListAddedActivityPayload = {
  type: ActivityType.LIST_ADDED;
  user: string;
  sourceBoard: string;
};

type CardAddedActivityPayload = {
  type: ActivityType.CARD_ADDED;
  user: string;
  sourceBoard: string;
  card: string;
  sourceListTitle: string;
};
