import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RequiresPermission } from 'src/permissions/decorators/requires-permission.decorator';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user.sub);
  }

  @Get()
  findAllWorkspaces(@ActiveUser() user: ActiveUserData) {
    return this.workspacesService.findAll({});
  }

  @Get('user')
  findWorkspacesByUser(@ActiveUser() user: ActiveUserData) {
    return this.workspacesService.findWorkspacesByUser(user.sub);
  }

  @Get(':workspaceId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('viewWorkspace')
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Delete(':workspaceId')
  @UseGuards(PermissionsGuard)
  @RequiresPermission('removeWorkspace')
  delete(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.delete(workspaceId);
  }
}
