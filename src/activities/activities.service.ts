import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { activityTemplates } from './templates/activity.templates';
import {
  ActivityPlaceholders,
  ActivityType,
} from './entities/types/activity.types';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async logActivity<T extends ActivityType>(
    type: T,
    placeholders: ActivityPlaceholders[T],
    metadata: {
      user?: string;
      card?: string;
      list?: string;
      board?: string;
      sourceList?: string;
      destinationList?: string;
      sourceBoard?: string;
      destinationBoard?: string;
    },
  ): Promise<Activity> {
    const activityData = this._createActivity(type, placeholders);

    const partialActivity: DeepPartial<Activity> = {
      ...activityData,
      user: metadata.user ? { id: metadata.user } : undefined,
      card: metadata.card ? { id: metadata.card } : undefined,
      sourceList: metadata.sourceList ? { id: metadata.sourceList } : undefined,
      destinationList: metadata.destinationList
        ? { id: metadata.destinationList }
        : undefined,
      sourceBoard: metadata.sourceBoard
        ? { id: metadata.sourceBoard }
        : undefined,
      destinationBoard: metadata.destinationBoard
        ? { id: metadata.destinationBoard }
        : undefined,
    };

    const activity = this.activityRepository.create(partialActivity);
    return this.activityRepository.save(activity);
  }

  async getCardActivities(cardId: string) {
    return this.activityRepository.find({
      where: { card: { id: cardId } },
      order: { timestamp: 'DESC' },
    });
  }

  async getBoardActivities(boardId: string) {
    return this.activityRepository.find({
      where: { sourceBoard: { id: boardId } },
      order: { timestamp: 'DESC' },
    });
  }

  async getUserActivities(userId: string) {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
    });
  }

  // src/activity/activity.factory.ts
  private async _createActivity<T extends ActivityType>(
    type: T,
    placeholders: ActivityPlaceholders[T],
  ): Promise<Partial<Activity>> {
    const template = activityTemplates[type];

    if (!template) {
      const msg = `Activity type ${type} is not defined`;
      console.error(msg);
      throw new Error(msg);
    }

    // Validate placeholders
    const missingKeys = template.placeholders.filter(
      (key) => !(key in placeholders),
    );
    if (missingKeys.length > 0) {
      const msg = `Missing placeholders for keys: ${missingKeys.join(', ')}`;
      console.error(msg);
      throw new Error(msg);
    }

    return {
      type,
      textTemplate: template.textTemplate,
      placeholders,
      timestamp: new Date(),
    };
  }
}
