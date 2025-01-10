import { activityTemplates } from 'src/activities/templates/activity.templates';

type Placeholder = { id: string; name: string };

// Derive types from activityTemplates
type ActivityTemplates = typeof activityTemplates;

// Derive the placeholders for each activity type
export type ActivityPlaceholders = {
  [Key in keyof ActivityTemplates]: {
    [PlaceholderKey in ActivityTemplates[Key]['placeholders'][number]]: Placeholder;
  };
};

// Derive the string values of textTemplate
export type TextTemplateStrings =
  ActivityTemplates[keyof ActivityTemplates]['textTemplate'];

// Derive the activity type keys
export type ActivityType = keyof ActivityTemplates;
