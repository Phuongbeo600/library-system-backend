import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DatabaseService } from '../database/database.service';
import { FilterBookDto } from './dto/filter-book.dto';
import { title } from 'process';
import { contains } from 'class-validator';

@Injectable()
export class BooksService {
  constructor(private readonly db: DatabaseService) {}

  async create(createBookDto: CreateBookDto) {
    return await this.db.book.create({
      data: createBookDto,
    });
  }

  async findAll(filter: FilterBookDto) {
    const { search, author, category, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Nếu tìm cụ thể theo author
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }

    // Nếu tìm cụ thể theo category
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // 4. Chạy đồng thời 2 query: Lấy data và đếm tổng số bản ghi
    const [data, total] = await Promise.all([
      this.db.book.findMany({
        where, // Áp dụng điều kiện lọc
        skip, // Bỏ qua bao nhiêu bản ghi
        take: limit, // Lấy bao nhiêu bản ghi
        orderBy: { createdAt: 'desc' }, // Sắp xếp mới nhất lên đầu (nếu DB của bạn có trường createdAt)
      }),
      this.db.book.count({ where }), // Đếm tổng số để tính số trang
    ]);

    // 5. Trả về kết quả kèm metadata phân trang
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const book = await this.db.book.findUnique({
      where: { id },
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID #${id}`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    return await this.db.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.db.book.delete({
      where: { id },
    });
  }
}
