import { ActivityEvent } from '../enums/activity-event.enum';
import {
  AddingCardBoardMessage,
  AddingCardCardMessage,
  AddingCardProfileMessage,
} from '../strategies/activity-message-constructor/concrete-implementations/add-card.startegies';
import { ActivityMessageConstructor } from '../strategies/activity-message-constructor/interfaces/activity-message-constructor.interface';
import { ActivityPage } from '../types/activity-page.type';

export class ActivityMessageConstructorFactory {
  static getConstructor(
    type: `${ActivityEvent}`,
    page: ActivityPage,
  ): ActivityMessageConstructor {
    switch (type) {
      case 'CARD_ADDED':
        switch (page) {
          case 'profile':
            return new AddingCardProfileMessage();
          case 'board':
            return new AddingCardBoardMessage();
          case 'card':
            return new AddingCardCardMessage();
          default:
            const _unreachable: never = page;
            throw new Error(`Unsupported page type: ${page}`);
        }
      default:
        const _unreachable: never = type;
        throw new Error(`Unsupported activity type: ${type}`);
    }
  }
}
