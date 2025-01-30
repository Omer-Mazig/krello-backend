import { IsEnum, IsOptional } from 'class-validator';

export enum WorkspaceMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class UpdateWorkspaceMemberDto {
  @IsOptional()
  @IsEnum(WorkspaceMemberRole)
  role?: WorkspaceMemberRole;
}
