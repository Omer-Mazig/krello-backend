import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  imports: [TypeOrmModule.forFeature([Activity])],
})
export class ActivitiesModule {}
