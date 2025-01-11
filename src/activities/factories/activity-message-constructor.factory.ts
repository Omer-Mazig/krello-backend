import { ActivityEvent } from '../enums/activity-event.enum';
import {
  CardAddedBoardActivityMessage,
  CardAddedCardActivityMessage,
  CardAddedProfileActivityMessage,
} from '../strategies/activity-message-constructor/concrete-implementations/add-card.startegies';
import { ActivityMessageConstructor } from '../strategies/activity-message-constructor/interfaces/activity-message-constructor.interface';
import { ActivityPage } from '../types/activity-page.type';
import {
  UnsupportedActivityTypeError,
  UnsupportedPageTypeError,
} from '../utils/errors';

type ConstructorMap = {
  [key in ActivityEvent]: Partial<
    Record<ActivityPage, new () => ActivityMessageConstructor>
  >;
};

/**
 * Factory class to retrieve the appropriate `ActivityMessageConstructor` implementation
 * based on the `ActivityEvent` type and the `ActivityPage`.
 */
export class ActivityMessageConstructorFactory {
  /**
   * Mapping configuration for `ActivityEvent` types and their corresponding constructors
   * based on the `ActivityPage`.
   *
   * This acts as the source of truth for determining which constructor to use for
   * each combination of activity event and page type.
   */
  private static constructorMap: ConstructorMap = {
    BOARD_ADDED: {
      profile: CardAddedProfileActivityMessage,
      board: CardAddedBoardActivityMessage,
    },
    LIST_ADDED: {
      profile: CardAddedProfileActivityMessage,
      board: CardAddedBoardActivityMessage,
    },
    CARD_ADDED: {
      profile: CardAddedProfileActivityMessage,
      board: CardAddedBoardActivityMessage,
      card: CardAddedCardActivityMessage,
    },
  };

  /**
   * Retrieves the appropriate `ActivityMessageConstructor` based on the provided
   * activity event type and page type.
   *
   * @param {`${ActivityEvent}`} type - The type of the activity event (e.g., `CARD_ADDED`, `BOARD_ADDED`).
   * @param {ActivityPage} page - The type of the activity page (e.g., `profile`, `board`, `card`).
   * @returns {ActivityMessageConstructor} The constructor for the specified activity event and page.
   * @throws {UnsupportedActivityTypeError} If the provided `type` is not supported.
   * @throws {UnsupportedPageTypeError} If the provided `page` is not supported for the given `type`.
   *
   */
  static getConstructor(
    type: `${ActivityEvent}`,
    page: ActivityPage,
  ): ActivityMessageConstructor {
    const pageConstructors = this.constructorMap[type];
    if (!pageConstructors) {
      throw new UnsupportedActivityTypeError(type, this.name);
    }

    const Constructor = pageConstructors[page];
    if (!Constructor) {
      throw new UnsupportedPageTypeError(page, this.name);
    }

    return new Constructor();
  }
}
