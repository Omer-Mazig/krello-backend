import { Activity } from 'src/activities/entities/activity.entity';

export interface ActivityMessageConstructor {
  construct(activity: Activity): {
    parts: Array<{
      type: 'text' | 'link';
      content: string;
      referenceId?: string;
    }>;
  };
}
