import { Activity } from 'src/activities/entities/activity.entity';

// TODO: add property 'entitiy' for link and style(list / user)
export interface ActivityMessageConstructor {
  construct(activity: Activity): {
    parts: Array<{
      type: 'text' | 'link';
      content: string;
      referenceId?: string;
    }>;
  };
}
