import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';

export class AddingCardProfileMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      message: `User ${activity.user.name} added a card`,
      references: {
        card: {
          id: activity.card.id,
          label: activity.card.title,
          isClickable: true,
        },
        list: {
          id: activity.listName,
          label: activity.listName,
          isClickable: false,
        },
      },
    };
  }
}

export class AddingCardBoardMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      message: `User ${activity.user.name} added a card`,
      references: {
        card: {
          id: activity.card.id,
          label: activity.card.title,
          isClickable: true,
        },
        list: {
          id: activity.listName,
          label: activity.listName,
          isClickable: false,
        },
      },
    };
  }
}

export class AddingCardCardMessage implements ActivityMessageConstructor {
  construct(activity: Activity) {
    return {
      message: `User ${activity.user.name} added this card`,
      references: {
        list: {
          id: activity.listName,
          label: activity.listName,
          isClickable: false,
        },
      },
    };
  }
}
