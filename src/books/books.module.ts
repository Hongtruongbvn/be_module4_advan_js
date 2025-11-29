import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schema/book.schema';

@Module({imports:[MongooseModule.forFeature([{name:Book.name,schema:BookSchema}])],
  controllers: [BooksController],
  providers: [BooksService],
  exports:[BooksModule]
})
export class BooksModule {}
