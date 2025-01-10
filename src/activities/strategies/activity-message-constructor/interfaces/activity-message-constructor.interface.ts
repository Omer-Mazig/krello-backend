import { Activity } from 'src/activities/entities/activity.entity';

export interface ActivityMessageConstructor {
  construct(activity: Activity): {
    message: string;
    references: {
      [key: string]: { id: string; label: string; isClickable: boolean };
    };
  };
}
