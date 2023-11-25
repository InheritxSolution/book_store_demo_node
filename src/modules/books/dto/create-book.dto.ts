import { IsNotEmpty, Length } from "class-validator";

export class CreateBookDto {
  @IsNotEmpty()
  bookName: string;

  @IsNotEmpty()
  @Length(13, 13)
  isbn: string;
}