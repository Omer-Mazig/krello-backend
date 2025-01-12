import { Injectable } from '@nestjs/common';
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
  async createActivity<TActivityPayload>(
    payload: TActivityPayload,
  ): Promise<Activity> {
    const activity = this.activityRepository.create(
      payload as DeepPartial<Activity>,
    ); // Explicitly cast to DeepPartial<Activity>

    return this.activityRepository.save(activity);
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
      relations: ['user', 'board', 'card'],
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
      relations: ['user', 'board', 'card'],
    });

    return activities.map((activity) =>
      ActivityMessageConstructorFactory.getConstructor(
        activity.type,
        'card',
      ).construct(activity),
    );
  }
}
