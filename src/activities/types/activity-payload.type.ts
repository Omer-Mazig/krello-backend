import { ActivityEvent } from '../enums/activity-event.enum';

export type AddCardActivityPayload = {
  type: ActivityEvent.CARD_ADDED;
  userId: string;
  sourceBoardId: string;
  cardId: string;
  sourceListTitle: string;
};

export type AddListActivityPayload = {
  type: ActivityEvent.LIST_ADDED;
  userId: string;
  sourceBoardId: string;
};
