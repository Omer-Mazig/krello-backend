import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageBuilder } from '../builders/activity-message.builder';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { validateActivityFields } from 'src/activities/utils/validate-activity-fields.util';

export class CardAddedProfileConstructor implements ActivityMessageConstructor {
  private readonly builder;

  constructor(builder: ActivityMessageBuilder) {
    this.builder = builder;
  }

  construct(activity: Activity) {
    validateActivityFields(
      activity,
      ['card', 'sourceListTitle'],
      this.constructor.name,
    );

    return this.builder
      .addUserLink(activity.user.username, activity.user.id)
      .addText('added')
      .addLink(activity.card.title, activity.card.id)
      .addText('to')
      .addStyledText(activity.sourceListTitle)
      .build();
  }
}

export class CardAddedBoardConstructor implements ActivityMessageConstructor {
  private readonly builder;

  constructor(builder: ActivityMessageBuilder) {
    this.builder = builder;
  }

  construct(activity: Activity) {
    validateActivityFields(
      activity,
      ['card', 'sourceListTitle'],
      this.constructor.name,
    );

    return this.builder
      .addUserLink(activity.user.username, activity.user.id)
      .addText('added')
      .addLink(activity.card.title, activity.card.id)
      .addText('to')
      .addStyledText(activity.sourceListTitle)
      .build();
  }
}

export class CardAddedCardConstructor implements ActivityMessageConstructor {
  private readonly builder;

  constructor(builder: ActivityMessageBuilder) {
    this.builder = builder;
  }

  construct(activity: Activity) {
    return this.builder
      .addUserLink(activity.user.username, activity.user.id)
      .addText('added this card')
      .build();
  }
}
