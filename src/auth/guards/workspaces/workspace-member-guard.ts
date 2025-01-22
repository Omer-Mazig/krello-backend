import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    const workspaceId = request.params?.workspaceId;

    if (!workspaceId || !user.sub) {
      throw new ForbiddenException('Workspace ID and User ID are required');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: user.sub },
      },
      relations: {
        user: true,
        workspace: true,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You must be a workspace member to perform this action',
      );
    }

    return true;
  }
}
