import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityPayload } from './types/activity-payload.type';
import { ActivityMessageConstructorFactory } from './factories/activity-message-constructor.factory';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async createActivity(payload: ActivityPayload): Promise<Activity> {
    const activity = this.activityRepository.create({
      type: payload.type,
      user: { id: payload.userId }, // Ensure this is a valid DeepPartial<User>
      board: { id: payload.boardId }, // Ensure this is a valid DeepPartial<Board>
      card: payload.cardId ? { id: payload.cardId } : undefined, // Valid DeepPartial<Card>
      listName: payload.listName || null,
      extraData: payload.extraData || null,
    } as DeepPartial<Activity>); // Explicitly cast to DeepPartial<Activity>

    return this.activityRepository.save(activity);
  }

  async queryProfileActivities(userId: string) {
    const activities = await this.activityRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'board', 'card'],
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
      where: { board: { id: boardId } },
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
