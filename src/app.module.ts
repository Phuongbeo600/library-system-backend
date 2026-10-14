import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { DatabaseModule } from './database/database.module';
import { BorrowingsModule } from './borrowings/borrowings.module';


@Module({
  imports: [UsersModule, BooksModule, DatabaseModule, BorrowingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
