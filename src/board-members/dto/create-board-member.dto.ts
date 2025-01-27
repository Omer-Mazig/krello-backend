import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBoardMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  boardId: string;
}
