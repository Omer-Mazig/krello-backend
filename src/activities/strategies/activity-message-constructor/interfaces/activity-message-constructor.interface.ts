import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessagePartObject } from '../types/activity-message.type';

// TODO: add property 'entitiy' for link and style(list / user)
export interface ActivityMessageConstructor {
  construct(activity: Activity): {
    parts: ActivityMessagePartObject[];
  };
}
