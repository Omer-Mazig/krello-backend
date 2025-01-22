import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWorkspaceMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
