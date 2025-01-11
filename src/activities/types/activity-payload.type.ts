import { ActivityEvent } from '../enums/activity-event.enum';

// Define ActivityPayloadMap with required keys from ActivityEvent
export type ActivityPayloadMap = {
  [ActivityEvent.LIST_ADDED]: ListAddedActivityPayload;
  [ActivityEvent.CARD_ADDED]: CardAddedActivityPayload;
  [ActivityEvent.BOARD_ADDED]: BoardAddedActivityPayload;
};

// Type-level enforcement for completeness
export type EnsureAllEventsCovered =
  keyof ActivityPayloadMap extends ActivityEvent
    ? ActivityEvent extends keyof ActivityPayloadMap
      ? true
      : false
    : false;

// If there are missing keys, this will cause a TypeScript error
const _ensureAllEventsCovered: EnsureAllEventsCovered = true;

export type BoardAddedActivityPayload = {
  type: ActivityEvent.BOARD_ADDED;
  userId: string;
  sourceBoardId: string;
};

export type ListAddedActivityPayload = {
  type: ActivityEvent.LIST_ADDED;
  userId: string;
  sourceBoardId: string;
};

export type CardAddedActivityPayload = {
  type: ActivityEvent.CARD_ADDED;
  userId: string;
  sourceBoardId: string;
  cardId: string;
  sourceListTitle: string;
};
