import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';

@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Post()
  create(@Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingsService.create(createBorrowingDto);
  }

  @Patch(':id/return')
  returnBook(@Param('id') id: string) {
    return this.borrowingsService.returnBook(+id);
  }
}
