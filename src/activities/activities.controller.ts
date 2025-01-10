import { Controller, Get, Param } from '@nestjs/common';
import { ActivityService } from './activities.service';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/profile/:userId')
  async getProfileActivities(@Param('userId') userId: string) {
    return this.activityService.queryProfileActivities(userId);
  }

  @Get('/board/:boardId')
  async getBoardActivities(@Param('boardId') boardId: string) {
    return this.activityService.queryBoardActivities(boardId);
  }

  @Get('/card/:cardId')
  async getCardActivities(@Param('cardId') cardId: string) {
    return this.activityService.queryCardActivities(cardId);
  }
}
