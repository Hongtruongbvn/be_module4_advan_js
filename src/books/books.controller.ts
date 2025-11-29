// src/books/books.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Session, UnauthorizedException } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get('isbn/:isbn')
  findByIsbn(@Param('isbn') isbn: string) {
    return this.booksService.findByIsbn(isbn);
  }

  @Get('nyt/:nytBookId')
  findByNytId(@Param('nytBookId') nytBookId: string) {
    return this.booksService.findByNytId(nytBookId);
  }

  @Get('identifier/:identifier')
  getBookByIdentifier(@Param('identifier') identifier: string) {
    return this.booksService.getBookByIdentifier(identifier);
  }

  @Post()
  create(@Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to add books');
    }
    return this.booksService.SaveBook(body, session.user._id);
  }

  @Post('like-with-create')
  async toggleLikeWithCreate(@Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to like books');
    }
    const { bookIdentifier, bookData } = body;
    return this.booksService.toggleLikeWithAutoCreate(bookIdentifier, session.user._id, bookData);
  }

  @Post(':id/rate')
  rateBook(@Param('id') id: string, @Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to rate books');
    }
    const { rating } = body;
    return this.booksService.rateBook(id, session.user._id, rating);
  }

  @Get(':id/rating/:userId')
  getUserRating(@Param('id') id: string, @Param('userId') userId: string, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login');
    }
    return this.booksService.getUserRating(id, userId);
  }

  @Get(':id/ratings')
  getBookRatings(@Param('id') id: string) {
    return this.booksService.getBookRatings(id);
  }

  @Delete(':id/rating/:userId')
  deleteRating(@Param('id') id: string, @Param('userId') userId: string, @Session() session: any) {
    if (!session.user || session.user._id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }
    return this.booksService.deleteRating(id, userId);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') bookId: string, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to like books');
    }
    return this.booksService.toggleLike(bookId, session.user._id);
  }

  @Get('user/:userId/liked')
  async getLikedBooks(@Param('userId') userId: string, @Session() session: any) {
    if (!session.user || session.user._id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }
    return this.booksService.getLikedBooks(userId);
  }

  @Get(':id/like-status/:userId')
  async getLikeStatus(@Param('id') bookId: string, @Param('userId') userId: string, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login');
    }
    const isLiked = await this.booksService.isBookLiked(bookId, userId);
    return { isLiked };
  }

  @Get('my/liked')
  async getMyLikedBooks(@Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to view liked books');
    }
    return this.booksService.getLikedBooks(session.user._id);
  }

  @Get(':id/my-like-status')
  async getMyLikeStatus(@Param('id') bookId: string, @Session() session: any) {
    if (!session.user) {
      return { isLiked: false };
    }
    const isLiked = await this.booksService.isBookLiked(bookId, session.user._id);
    return { isLiked };
  }
}