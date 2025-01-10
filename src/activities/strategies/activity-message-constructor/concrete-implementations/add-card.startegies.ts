import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { createPart } from 'src/activities/utils/create-parts.util';

export class AddingCardProfileMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      parts: [
        createPart('link', `${activity.user.name}`, activity.user.id),
        createPart('text', `added`),
        createPart('link', activity.card.title, activity.card.id),
        createPart('text', `to`),
        createPart('text', `${activity.sourceListTitle}`), // Non-clickable
      ],
    };
  }
}

export class AddingCardBoardMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      parts: [
        createPart('link', `${activity.user.name}`, activity.user.id),
        createPart('text', `added`),
        createPart('link', activity.card.title, activity.card.id),
        createPart('text', `to`),
        createPart('text', `${activity.sourceListTitle}`), // Non-clickable
      ],
    };
  }
}

export class AddingCardCardMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      parts: [
        createPart('link', `${activity.user.name}`, activity.user.id),
        createPart('text', `added this card`),
      ],
    };
  }
}
