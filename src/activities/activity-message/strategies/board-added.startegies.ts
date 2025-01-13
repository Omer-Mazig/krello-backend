import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageBuilder } from '../builders/activity-message-builder';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { validateActivityFields } from 'src/activities/utils/validate-activity-fields.util';

export class BoardAddedProfileConstructor
  implements ActivityMessageConstructor
{
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
      .addLink(activity.user.username, activity.user.id)
      .addText('created')
      .addLink(activity.sourceBoard.name, activity.sourceBoard.id)
      .build();
  }
}

export class BoardAddedBoardConstructor implements ActivityMessageConstructor {
  private readonly builder;

  constructor(builder: ActivityMessageBuilder) {
    this.builder = builder;
  }

  construct(activity: Activity) {
    return this.builder
      .addLink(activity.user.username, activity.user.id)
      .addText('created this board')
      .build();
  }
}
