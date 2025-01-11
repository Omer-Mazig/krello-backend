import { ActivityEvent } from '../enums/activity-event.enum';
import {
  CardAddedBoardActivityMessage,
  CardAddedCardActivityMessage,
  CardAddedProfileActivityMessage,
} from '../strategies/activity-message-constructor/concrete-implementations/add-card.startegies';
import { ActivityMessageConstructor } from '../strategies/activity-message-constructor/interfaces/activity-message-constructor.interface';
import { ActivityPage } from '../types/activity-page.type';

// TODO: 1. consider creating an interface for each type
// TODO: 2. figure out a way to strict new [somestrategy] (new AddingCardProfileMessage(); in bard added for example...) maybe 1 will solve it
export class ActivityMessageConstructorFactory {
  static getConstructor(
    type: `${ActivityEvent}`,
    page: ActivityPage,
  ): ActivityMessageConstructor {
    switch (type) {
      case 'BOARD_ADDED':
        switch (page) {
          case 'profile':
            return new CardAddedProfileActivityMessage(); // not real... just placeholder for typescript for now. implment later
          case 'board':
            return new CardAddedBoardActivityMessage(); // not real... just placeholder for typescript for now. implment later
          case 'card':
            return new CardAddedCardActivityMessage(); // not real... just placeholder for typescript for now. implment later
          default:
            const _unreachable: never = page;
            throw new Error(`Unsupported page type: ${page}`);
        }
      case 'LIST_ADDED':
        switch (page) {
          case 'profile':
            return new CardAddedProfileActivityMessage(); // not real... just placeholder for typescript for now. implment later
          case 'board':
            return new CardAddedBoardActivityMessage(); // not real... just placeholder for typescript for now. implment later
          case 'card':
            return new CardAddedCardActivityMessage(); // not real... just placeholder for typescript for now. implment later
          default:
            const _unreachable: never = page;
            throw new Error(`Unsupported page type: ${page}`);
        }

      case 'CARD_ADDED':
        switch (page) {
          case 'profile':
            return new CardAddedProfileActivityMessage();
          case 'board':
            return new CardAddedBoardActivityMessage();
          case 'card':
            return new CardAddedCardActivityMessage();
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
