import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { CreateWorkspaceMemberDto } from 'src/workspace-members/dto/create-workspace-member.dto';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';
import { UpdateWorkspaceMemberDto } from './dto/update-workspace-member.dto';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequiresPermission('createWorkspaceMember')
  create(@Body() createWorkspaceMemberDto: CreateWorkspaceMemberDto) {
    return this.workspaceMembersService.create(createWorkspaceMemberDto);
  }

  @Patch(':workspaceId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('changeWorkspaceMemberRole')
  update(
    @Param('memberId') memberId: string,
    @Body() updateWorkspaceMemberDto: UpdateWorkspaceMemberDto,
  ) {
    return this.workspaceMembersService.update(
      memberId,
      updateWorkspaceMemberDto,
    );
  }

  @Delete(':workspaceId/:memberId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeWorkspaceMember')
  remove(@Param('memberId') memberId: string) {
    return this.workspaceMembersService.remove(memberId);
  }
}
