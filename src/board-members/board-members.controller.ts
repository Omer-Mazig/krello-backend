import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createBoardMember')
  create(@Body() createBoardMemberDto: CreateBoardMemberDto) {
    return this.boardMembersService.create(createBoardMemberDto);
  }

  @Patch(':boardId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('changeBoardMemberRole')
  update(
    @Param('memberId') memberId: string,
    @Body() updateBoardMemberDto: UpdateBoardMemberDto,
  ) {
    return this.boardMembersService.update(memberId, updateBoardMemberDto);
  }

  @Delete(':boardId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeBoardMember')
  remove(@Param('memberId') memberId: string) {
    return this.boardMembersService.remove(memberId);
  }
}
