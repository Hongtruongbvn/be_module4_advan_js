import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { BooksModule } from 'src/books/books.module';
import { Book, BookSchema } from 'src/books/schema/book.schema';

@Module({  imports: [
    MongooseModule.forFeature([ { name: Comment.name, schema: CommentSchema },
      { name: Book.name, schema: BookSchema }]),
    BooksModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
