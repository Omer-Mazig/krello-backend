import { Activity } from 'src/activities/entities/activity.entity';
import { ActivityMessageBuilder } from '../builders/activity-message-builder';
import { ActivityMessageConstructor } from '../interfaces/activity-message-constructor.interface';
import { validateActivityFields } from 'src/activities/utils/validate-activity-fields.util';

export class BoardAddedProfileActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    // UNCOMMENT this to see the BadRequestException(`Missing [${field}] on activity`)
    validateActivityFields(
      activity,
      ['sourceListTitle', 'card'],
      this.constructor.name,
    );
    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.username, activity.user.id)
      .addText('created')
      .addLink(activity.sourceBoard.name, activity.sourceBoard.id)
      .build();
  }
}

export class BoardAddedBoardActivityMessage
  implements ActivityMessageConstructor
{
  construct(activity: Activity) {
    const builder = new ActivityMessageBuilder();
    return builder
      .addLink(activity.user.username, activity.user.id)
      .addText('created this board')
      .build();
  }
}
