import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createBoardMember')
  create(@Body() createBoardMemberDto: CreateBoardMemberDto) {
    return this.boardMembersService.create(createBoardMemberDto);
  }

  @Delete(':boardId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeBoardMember')
  remove(@Param('memberId') memberId: string) {
    return this.boardMembersService.remove(memberId);
  }
}
