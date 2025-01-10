import { Controller, Get, Param } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activityService: ActivitiesService) {}

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
