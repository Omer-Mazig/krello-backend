import { ActivityEvent } from '../enums/activity-event.enum';

export type ActivityPayload = {
  type: ActivityEvent;
  userId: string;
  boardId: string;
  cardId?: string;
  listName?: string;
  extraData?: Record<string, any>; // For additional fields like source/destination lists
};
