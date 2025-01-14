import { Controller, Get, Param } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('/profile')
  async getProfileActivities(@ActiveUser() user: ActiveUserData) {
    return this.activitiesService.queryProfileActivities(user.sub);
  }

  @Get('/board/:boardId')
  async getBoardActivities(@Param('boardId') boardId: string) {
    return this.activitiesService.queryBoardActivities(boardId);
  }

  @Get('/card/:cardId')
  async getCardActivities(@Param('cardId') cardId: string) {
    return this.activitiesService.queryCardActivities(cardId);
  }
}
