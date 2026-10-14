import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBorrowingDto {
  @IsString()
  @IsNotEmpty()
  borrowerCode: string;

  @IsInt()
  @IsNotEmpty()
  bookId: number;
}
