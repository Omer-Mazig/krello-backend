import { Body, Controller, Param, Post } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';

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

  @Post(':workspaceId/members')
  @Auth(AuthType.WorkspaceMember)
  async addWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Body('userId') userId: string,
  ) {
    return await this.workspacesService.addMember(workspaceId, userId);
  }
}
