import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageBuilder } from '../builders/activity-message-builder';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { BadRequestException } from '@nestjs/common';

export class CardAddedProfileActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    if (!activity.card) {
      throw new BadRequestException('Missing [card] on activity');
    }

    if (!activity.sourceListTitle) {
      throw new BadRequestException('Missing [sourceListTitle] on activity');
    }

    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.name, activity.user.id)
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
    if (!activity.card) {
      throw new BadRequestException('Missing [card] on activity');
    }

    if (!activity.sourceListTitle) {
      throw new BadRequestException('Missing [sourceListTitle] on activity');
    }

    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.name, activity.user.id)
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
    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.name, activity.user.id)
      .addText('added this card')
      .build();
  }
}
