import { ActivityEvent } from '../enums/activity-event.enum';
import {
  AddingCardBoardMessage,
  AddingCardCardMessage,
  AddingCardProfileMessage,
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
            return new AddingCardProfileMessage(); // not real... just placeholder for typescript for now. implment later
          case 'board':
            return new AddingCardBoardMessage(); // not real... just placeholder for typescript for now. implment later
          case 'card':
            return new AddingCardCardMessage(); // not real... just placeholder for typescript for now. implment later
          default:
            const _unreachable: never = page;
            throw new Error(`Unsupported page type: ${page}`);
        }
      case 'LIST_ADDED':
        switch (page) {
          case 'profile':
            return new AddingCardProfileMessage(); // not real... just placeholder for typescript for now. implment later
          case 'board':
            return new AddingCardBoardMessage(); // not real... just placeholder for typescript for now. implment later
          case 'card':
            return new AddingCardCardMessage(); // not real... just placeholder for typescript for now. implment later
          default:
            const _unreachable: never = page;
            throw new Error(`Unsupported page type: ${page}`);
        }

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
