import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessagePartObject } from '../types/activity-message.type';

/**
 * Interface for constructing structured activity messages.
 *
 * Classes implementing this interface are responsible for generating activity messages
 * based on an `Activity` entity. The output is an array of message parts, where each part
 * defines a specific segment of the activity message (e.g., text, link, or styled text).
 *
 * @todo Add a property `entity` to support links and styles (e.g., for lists or users).
 */
export interface ActivityMessageConstructor {
  /**
   * Constructs an activity message from the provided `Activity` entity.
   *
   * @param {Activity} activity - The activity entity used to generate the message.
   * @returns {{ parts: ActivityMessagePartObject[] }} An object containing an array of
   * structured message parts, where each part represents a segment of the message.
   *
   * @example
   * ```typescript
   * const activityMessage = constructor.construct(activity);
   * console.log(activityMessage.parts);
   * // Output example:
   * // [
   * //   { type: 'text', content: 'User' },
   * //   { type: 'link', content: 'John Doe', referenceId: '123' },
   * //   { type: 'text', content: 'added a card to' },
   * //   { type: 'styled-text', content: 'To-Do List' }
   * // ]
   * ```
   */
  construct(activity: Activity): {
    parts: ActivityMessagePartObject[];
  };
}
