import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(
    { title, boardId, position }: CreateListDto,
    userId: string,
  ): Promise<List> {
    const newList = this.listRepository.create({
      title,
      board: { id: boardId },
      position,
    });
    const savedList = await this.listRepository.save(newList);

    return savedList;
  }
}
