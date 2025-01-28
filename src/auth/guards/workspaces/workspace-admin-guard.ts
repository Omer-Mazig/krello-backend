import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspaceAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    // TODO: do i really need workspaceId?
    const workspaceId =
      request.params?.workspaceId || request.body?.workspaceId;

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

    if (!member || member.role !== 'admin') {
      throw new ForbiddenException(
        'You must be a workspace admin to perform this action',
      );
    }

    return true;
  }
}
