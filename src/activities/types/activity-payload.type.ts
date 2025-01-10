import { ActivityEvent } from '../enums/activity-event.enum';

export type AddCardActivityPayload = {
  type: ActivityEvent.ADDING_CARD;
  userId: string;
  boardId: string;
  cardId: string;
  listTitle: string;
};

export type AddListActivityPayload = {
  type: ActivityEvent.ADDING_LIST;
  userId: string;
  boardId: string;
};
