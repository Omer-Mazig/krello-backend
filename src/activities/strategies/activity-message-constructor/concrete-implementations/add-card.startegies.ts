import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageBuilder } from '../builders/activity-message-builder';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { validateActivityFields } from 'src/activities/utils/validateActivityFields.util';

export class CardAddedProfileActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    validateActivityFields(
      activity,
      ['card', 'sourceListTitle'],
      this.constructor.name,
    );

    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.username, activity.user.id)
      .addText('added')
      .addLink(activity.card.title, activity.card.id)
      .addText('to')
      .addStyledText(activity.sourceListTitle) // Non-clickable
      .build();
  }
}

export class CardAddedBoardActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    validateActivityFields(
      activity,
      ['card', 'sourceListTitle'],
      this.constructor.name,
    );

    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.username, activity.user.id)
      .addText('added')
      .addLink(activity.card.title, activity.card.id)
      .addText('to')
      .addStyledText(activity.sourceListTitle) // Non-clickable
      .build();
  }
}

export class CardAddedCardActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    validateActivityFields(activity, [], this.constructor.name);

    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.username, activity.user.id)
      .addText('added this card')
      .build();
  }
}
