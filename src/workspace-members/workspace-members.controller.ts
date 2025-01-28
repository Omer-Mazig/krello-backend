import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateWorkspaceMemberDto } from 'src/workspace-members/dto/create-workspace-member.dto';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @Auth(AuthType.WorkspaceMember)
  create(@Body() createWorkspaceMemberDto: CreateWorkspaceMemberDto) {
    return this.workspaceMembersService.create(createWorkspaceMemberDto);
  }

  @Delete(':memberId/:workspaceId')
  @Auth(AuthType.WorkspaceMember)
  remove(
    @Param('memberId') memberId: string,
    @Param('workspaceId') workspaceId: string, // for guard
  ) {
    return this.workspaceMembersService.remove(memberId);
  }
}
