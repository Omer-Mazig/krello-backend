import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(
    @Body() createListDto: CreateListDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.listsService.create(createListDto, user.sub);
  }

  // @Get()
  // findAll() {
  //   return this.listsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.listsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
  //   return this.listsService.update(+id, updateListDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.listsService.remove(+id);
  // }
}
