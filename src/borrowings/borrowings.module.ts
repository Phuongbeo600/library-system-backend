import { Module } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { DatabaseModule } from '../database/database.module'; // 1. Import DatabaseModule

@Module({
  imports: [DatabaseModule], // 2. Thêm vào mảng imports
  controllers: [BorrowingsController],
  providers: [BorrowingsService],
})
export class BorrowingsModule {}
