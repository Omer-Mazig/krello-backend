import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityMessageConstructorFactory } from './factories/activity-message-constructor.factory';
import { OnEvent } from '@nestjs/event-emitter';
import { BOARD_ADDED } from 'src/events/event.constants';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  @OnEvent(BOARD_ADDED)
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
      relations: {
        user: true,
        sourceBoard: true,
        card: true,
      },
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
      relations: {
        user: true,
        sourceBoard: true,
        card: true,
      },
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
      relations: {
        user: true,
        sourceBoard: true,
        card: true,
      },
    });

    return activities.map((activity) =>
      ActivityMessageConstructorFactory.getConstructor(
        activity.type,
        'card',
      ).construct(activity),
    );
  }
}
