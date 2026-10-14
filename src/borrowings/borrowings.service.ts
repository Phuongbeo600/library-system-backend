// file: src/borrowings/borrowings.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { FilterBorrowingDto } from './dto/filter-borrowing.dto';
@Injectable()
export class BorrowingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createBorrowingDto: CreateBorrowingDto) {
    const { borrowerCode, bookId } = createBorrowingDto;

    const book = await this.databaseService.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Không tìm thấy cuốn sách này!');
    }

    if (book.quantity <= 0) {
      throw new BadRequestException('Sách đã hết, không thể mượn!');
    }

    return this.databaseService.$transaction(async (tx: any) => {
      const borrowing = await tx.borrowing.create({
        data: {
          borrowerCode,
          bookId,
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { quantity: book.quantity - 1 },
      });

      return borrowing;
    });
  }

  async returnBook(borrowingId: number) {
    const borrowing = await this.databaseService.borrowing.findUnique({
      where: { id: borrowingId },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn này!');
    }

    if (borrowing.returnedAt) {
      throw new BadRequestException('Sách này đã được trả rồi!');
    }

    return this.databaseService.$transaction(async (tx: any) => {
      const updatedBorrowing = await tx.borrowing.update({
        where: { id: borrowingId },
        data: { returnedAt: new Date() },
      });

      await tx.book.update({
        where: { id: borrowing.bookId },
        data: { quantity: { increment: 1 } },
      });

      return updatedBorrowing;
    });
  }

  // 1. LẤY DANH SÁCH (CÓ PHÂN TRANG VÀ TÌM KIẾM)
  async findAll(filter: FilterBorrowingDto) {
    const { search, page = 1, limit = 10 } = filter;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.borrowerCode = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.databaseService.borrowing.findMany({
        where,
        skip,
        take: limitNum,
        include: { book: true },
        orderBy: { borrowedAt: 'desc' },
      }),
      this.databaseService.borrowing.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
