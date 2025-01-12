import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [ListsController],
  providers: [ListsService, EventEmitter2],
  imports: [TypeOrmModule.forFeature([List])],
})
export class ListsModule {}
