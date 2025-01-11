import { ActivityEvent } from '../enums/activity-event.enum';

// Define ActivityPayloadMap with required keys from ActivityEvent
export type ActivityPayloadMap = {
  [ActivityEvent.LIST_ADDED]: ListAddedActivityPayload;
  [ActivityEvent.CARD_ADDED]: CardAddedActivityPayload;
  [ActivityEvent.BOARD_ADDED]: BoardAddedActivityPayload;
};

// Enforce that ActivityPayloadMap has no extra keys
type NoExtraKeys<T, U> = keyof T extends U
  ? U extends keyof T
    ? true
    : false
  : false;

// Ensure ActivityPayloadMap matches exactly with ActivityEvent
type EnsureExactMatch = NoExtraKeys<ActivityPayloadMap, ActivityEvent>;

// If there are mismatches, this will cause a TypeScript error
const _ensureExactMatch: EnsureExactMatch = true;

// Payload Definitions
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
