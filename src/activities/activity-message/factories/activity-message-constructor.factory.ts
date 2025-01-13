import { ActivityType } from '../../enums/activity-type.enum';
import {
  CardAddedBoardConstructor,
  CardAddedCardConstructor,
  CardAddedProfileConstructor,
} from '../strategies/card-added.startegies';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { ActivityPage } from '../../types/activity-page.type';
import { UnsupportedActivityTypeError } from '../errors/unsupported-activity-type-error.error';
import {
  BoardAddedBoardConstructor,
  BoardAddedProfileConstructor as BoardAddedProfileConstructor,
} from '../strategies/board-added.startegies';
import { UnsupportedPageTypeError } from '../errors/unsupported-page-type-error.error';
import { ActivityMessageBuilder } from '../builders/activity-message-builder';

type ConstructorMap = {
  [key in ActivityType]: Partial<
    Record<
      ActivityPage,
      new (builder: ActivityMessageBuilder) => ActivityMessageConstructor
    >
  >;
};

/**
 * Factory class to retrieve the appropriate `ActivityMessageConstructor` implementation
 * based on the `ActivityType` type and the `ActivityPage`.
 */
export class ActivityMessageConstructorFactory {
  /**
   * Mapping configuration for `ActivityType` types and their corresponding constructors
   * based on the `ActivityPage`.
   *
   * This acts as the source of truth for determining which constructor to use for
   * each combination of activity event and page type.
   */
  private static constructorMap: ConstructorMap = {
    BOARD_ADDED: {
      profile: BoardAddedProfileConstructor,
      board: BoardAddedBoardConstructor,
    },
    LIST_ADDED: {
      profile: CardAddedProfileConstructor, // placeholder for now
      board: CardAddedBoardConstructor, // placeholder for now
    },
    CARD_ADDED: {
      profile: CardAddedProfileConstructor,
      board: CardAddedBoardConstructor,
      card: CardAddedCardConstructor,
    },
  };

  /**
   * Retrieves the appropriate `ActivityMessageConstructor` based on the provided
   * activity event type and page type.
   *
   * @param {`${ActivityType}`} type - The type of the activity event (e.g., `CARD_ADDED`, `BOARD_ADDED`).
   * @param {ActivityPage} page - The type of the activity page (e.g., `profile`, `board`, `card`).
   * @returns {ActivityMessageConstructor} The constructor for the specified activity event and page.
   * @throws {UnsupportedActivityTypeError} If the provided `type` is not supported.
   * @throws {UnsupportedPageTypeError} If the provided `page` is not supported for the given `type`.
   *
   */
  static create(
    type: `${ActivityType}`,
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

    return new Constructor(new ActivityMessageBuilder());
  }
}
