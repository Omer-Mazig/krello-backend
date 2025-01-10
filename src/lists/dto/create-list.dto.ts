import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  position: number;
}
