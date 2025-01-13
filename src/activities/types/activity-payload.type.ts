import { ActivityType } from '../enums/activity-type.enum';

// Define the mapping of activity events to payload types
export const activityPayloadMap = {
  [ActivityType.LIST_ADDED]: {
    type: ActivityType.LIST_ADDED,
    user: '',
    sourceBoard: '',
  },
  [ActivityType.CARD_ADDED]: {
    type: ActivityType.CARD_ADDED,
    user: '',
    sourceBoard: '',
    card: '',
    sourceListTitle: '',
  },
  [ActivityType.BOARD_ADDED]: {
    type: ActivityType.BOARD_ADDED,
    user: '',
    sourceBoard: '',
  },
} as const;

// Type from the runtime object
type ActivityPayloadMap = typeof activityPayloadMap;

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
