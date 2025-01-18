/**
 * Represents a single part of an activity message.
 *
 * Each part can be of a specific type (`text`, `link` or 'user-link') and contains the content
 * to display in the message. Optionally, a `referenceId` can be included for linking purposes.
 */
export type ActivityMessagePartObject = {
  /**
   * The type of the message part, determining how it should be displayed.
   * - `text`: Plain text.
   * - `link`: Clickable text linking to another entity (except user).
   * - `user-link`: Clickable text linking to a user entity.
   */
  type: 'text' | 'link' | 'user-link';

  /**
   * The content of the message part to be displayed.
   */
  content: string;

  /**
   * (Optional) A reference ID for `link` type parts, used to associate the link
   * with an entity (e.g., user ID, card ID, or list ID).
   */
  referenceId?: string;
};
