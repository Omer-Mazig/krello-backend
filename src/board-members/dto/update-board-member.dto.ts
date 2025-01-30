import { IsOptional } from 'class-validator';

import { IsEnum } from 'class-validator';

export enum BoardMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class UpdateBoardMemberDto {
  @IsOptional()
  @IsEnum(BoardMemberRole)
  role?: BoardMemberRole;
}
