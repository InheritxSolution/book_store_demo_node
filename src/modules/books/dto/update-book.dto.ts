import { IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class UpdateBookDto {
  @IsNotEmpty()
  @MinLength(1)
  bookName: string;
  
}