import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsString()
  @IsNotEmpty()
  listId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  position: number;
}
