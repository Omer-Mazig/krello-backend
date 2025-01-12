import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityMessageConstructorFactory } from './factories/activity-message-constructor.factory';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  //TODO: extract to 'ActivityCreatorProvider'
  async createActivity(payload: DeepPartial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(payload);

    try {
      return this.activityRepository.save(activity);
    } catch (error) {
      console.error(`Error creating activity with payload ${payload}`, error);
      throw new InternalServerErrorException(
        'Failed to create activity. Please try again later.',
      );
    }
  }

  async queryProfileActivities(userId: string) {
    const activities = await this.activityRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'sourceBoard', 'card'],
    });

    return activities.map((activity) =>
      ActivityMessageConstructorFactory.getConstructor(
        activity.type,
        'profile',
      ).construct(activity),
    );
  }

  async queryBoardActivities(boardId: string) {
    const activities = await this.activityRepository.find({
      where: { sourceBoard: { id: boardId } },
      relations: ['user', 'sourceBoard', 'card'],
    });

    return activities.map((activity) =>
      ActivityMessageConstructorFactory.getConstructor(
        activity.type,
        'board',
      ).construct(activity),
    );
  }

  async queryCardActivities(cardId: string) {
    const activities = await this.activityRepository.find({
      where: { card: { id: cardId } },
      relations: ['user', 'sourceBoard', 'card'],
    });

    return activities.map((activity) =>
      ActivityMessageConstructorFactory.getConstructor(
        activity.type,
        'card',
      ).construct(activity),
    );
  }
}
