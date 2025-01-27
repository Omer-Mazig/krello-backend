import { Body, Controller, Post } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  create(@Body() createBoardMemberDto: CreateBoardMemberDto) {
    return this.boardMembersService.create(createBoardMemberDto);
  }
}
