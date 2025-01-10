import { ActivityEvent } from '../enums/activity-event.enum';

export type AddCardActivityPayload = {
  type: ActivityEvent.ADDING_CARD;
  userId: string;
  sourceBoardId: string;
  cardId: string;
  sourceListTitle: string;
};

export type AddListActivityPayload = {
  type: ActivityEvent.ADDING_LIST;
  userId: string;
  sourceBoardId: string;
};
