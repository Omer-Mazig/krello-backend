import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;
}
