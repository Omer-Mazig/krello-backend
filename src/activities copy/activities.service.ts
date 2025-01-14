import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityMessageConstructorFactory } from './activity-message/factories/activity-message-constructor.factory';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_BOARD_ADDED } from 'src/constants/event.constants';
import { UnsupportedActivityTypeError } from './activity-message/errors/unsupported-activity-type-error.error';
import { UnsupportedPageTypeError } from './activity-message/errors/unsupported-page-type-error.error';
import { ActivityPage } from './types/activity-page.type';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  @OnEvent(EVENT_BOARD_ADDED)
  async createActivity(payload: DeepPartial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(payload);

    try {
      return this.activityRepository.save(activity);
    } catch (error) {
      console.error(
        `Error creating activity with payload ${JSON.stringify(payload)}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create activity. Please try again later.',
      );
    }
  }

  async queryProfileActivities(userId: string) {
    const activities = await this._fetchActivities({ user: { id: userId } });
    return this._constructActivityMessages(activities, 'profile');
  }

  async queryBoardActivities(boardId: string) {
    const activities = await this._fetchActivities({
      sourceBoard: { id: boardId },
    });
    return this._constructActivityMessages(activities, 'board');
  }

  async queryCardActivities(cardId: string) {
    const activities = await this._fetchActivities({ card: { id: cardId } });
    return this._constructActivityMessages(activities, 'card');
  }

  /**
   * Fetches activities from the repository based on the given condition.
   * @param where - The query condition for activities.
   * @returns A list of activities.
   */
  private async _fetchActivities(
    where: Record<string, any>,
  ): Promise<Activity[]> {
    try {
      return await this.activityRepository.find({
        where,
        relations: {
          user: true,
          sourceBoard: true,
          card: true,
        },
      });
    } catch (error) {
      console.error(
        `Error fetching activities with condition ${JSON.stringify(where)}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch activities. Please try again later.',
      );
    }
  }

  /**
   * Constructs activity messages using the factory.
   * @param activities - The list of activities to process.
   * @param page - The activity page type (`profile`, `board`, `card`).
   * @returns The constructed activity messages.
   */
  private _constructActivityMessages(
    activities: Activity[],
    page: ActivityPage,
  ) {
    return activities.map((activity) =>
      ActivityMessageConstructorFactory.create(activity.type, page).construct(
        activity,
      ),
    );
  }
}
