// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Book, BookDocument } from './schema/book.schema';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  private async findBookByIdOrIsbn(identifier: string) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const book = await this.bookModel.findById(identifier);
      if (book) return book;
    }
    
    const book = await this.bookModel.findOne({ 
      $or: [
        { primary_isbn13: identifier },
        { nytBookId: identifier }
      ]
    });
    
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    
    return book;
  }

  async findAll() {
    return this.bookModel.find().exec();
  }

  async findByIsbn(isbn: string) {
    return this.bookModel.findOne({ primary_isbn13: isbn }).exec();
  }

  async findByNytId(nytBookId: string) {
    return this.bookModel.findOne({ nytBookId }).exec();
  }

  async create(bookData: any) {
    // Kiểm tra xem book đã tồn tại chưa
    const existingBook = await this.bookModel.findOne({
      $or: [
        { primary_isbn13: bookData.primary_isbn13 },
        { nytBookId: bookData.nytBookId || bookData.primary_isbn13 }
      ]
    });

    if (existingBook) {
      return existingBook;
    }

    const book = new this.bookModel(bookData);
    return book.save();
  }

  async SaveBook(bookData: any, userId: string) {
    const book = new this.bookModel({
      ...bookData,
      userId: userId
    });
    return book.save();
  }

  async toggleLikeWithAutoCreate(bookIdentifier: string, userId: string, nytBookData?: any) {
    let book: BookDocument;

    try {
      // Thử tìm book trước
      book = await this.findBookByIdOrIsbn(bookIdentifier);
    } catch (error) {
      // Nếu book không tồn tại, tạo book mới
      if (error instanceof NotFoundException) {
        console.log(`Book ${bookIdentifier} not found, creating new book...`);
        
        let bookData: any = {
          userId: new mongoose.Types.ObjectId(userId),
          communityStats: {
            averageRating: 0,
            totalReviews: 0,
            totalVotes: 0,
            totalLikes: 0
          },
          ratings: [],
          likes: []
        };

        // Nếu có NYT book data, sử dụng nó
        if (nytBookData) {
          bookData = {
            ...bookData,
            nytBookId: nytBookData.primary_isbn13 || bookIdentifier,
            primary_isbn13: nytBookData.primary_isbn13 || bookIdentifier,
            title: nytBookData.title || `Book ${bookIdentifier}`,
            author: nytBookData.author || 'Unknown Author',
            description: nytBookData.description || 'No description available',
            book_image: nytBookData.book_image,
            amazon_product_url: nytBookData.amazon_product_url,
            publisher: nytBookData.publisher,
            rank: nytBookData.rank,
            weeks_on_list: nytBookData.weeks_on_list
          };
        } else {
          // Nếu không có NYT data, tạo book cơ bản
          bookData = {
            ...bookData,
            nytBookId: bookIdentifier,
            primary_isbn13: bookIdentifier,
            title: `Book ${bookIdentifier}`,
            author: 'Unknown Author',
            description: 'No description available'
          };

          // Kiểm tra xem có phải là ISBN không
          if (bookIdentifier.length === 13 && /^\d+$/.test(bookIdentifier)) {
            bookData.primary_isbn13 = bookIdentifier;
          }
        }

        book = await this.create(bookData);
      } else {
        throw error;
      }
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const likeIndex = book.likes.findIndex(
      likeUserId => likeUserId.toString() === userId
    );

    if (likeIndex > -1) {
      // Unlike
      book.likes.splice(likeIndex, 1);
      book.communityStats.totalLikes = Math.max(0, book.communityStats.totalLikes - 1);
    } else {
      // Like
      book.likes.push(userObjectId as any);
      book.communityStats.totalLikes += 1;
    }

    return book.save();
  }

  async rateBook(bookIdentifier: string, userId: string, rating: number) {
    const book = await this.findBookByIdOrIsbn(bookIdentifier);
    
    const existingRatingIndex = book.ratings.findIndex(
      r => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].rating = rating;
    } else {
      book.ratings.push({
        userId: userId as any,
        rating,
      });
    }

    this.updateCommunityStats(book);
    return book.save();
  }

  async getUserRating(bookIdentifier: string, userId: string) {
    const book = await this.findBookByIdOrIsbn(bookIdentifier);
    
    const userRating = book.ratings.find(r => r.userId.toString() === userId);
    return userRating || null;
  }

  async deleteRating(bookIdentifier: string, userId: string) {
    const book = await this.findBookByIdOrIsbn(bookIdentifier);
    
    const ratingIndex = book.ratings.findIndex(r => r.userId.toString() === userId);
    if (ratingIndex === -1) throw new NotFoundException('Rating not found');

    book.ratings.splice(ratingIndex, 1);
    this.updateCommunityStats(book);
    return book.save();
  }

  async getBookRatings(bookIdentifier: string) {
    const book = await this.findBookByIdOrIsbn(bookIdentifier);
    
    const populatedBook = await this.bookModel
      .findById(book._id)
      .populate('ratings.userId', 'username avatar')
      .exec();
    
    if (!populatedBook) {
      throw new NotFoundException('Book not found');
    }
    
    return populatedBook.ratings;
  }

  private updateCommunityStats(book: BookDocument) {
    if (book.ratings.length === 0) {
      book.communityStats.averageRating = 0;
      book.communityStats.totalReviews = 0;
      return;
    }

    const totalReviews = book.ratings.length;
    const averageRating = book.ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    book.communityStats.averageRating = Math.round(averageRating * 10) / 10;
    book.communityStats.totalReviews = totalReviews;
  }

  async toggleLike(bookIdentifier: string, userId: string) {
    const book = await this.findBookByIdOrIsbn(bookIdentifier);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const likeIndex = book.likes.findIndex(
      likeUserId => likeUserId.toString() === userId
    );

    if (likeIndex > -1) {
      book.likes.splice(likeIndex, 1);
      book.communityStats.totalLikes = Math.max(0, book.communityStats.totalLikes - 1);
    } else {
      book.likes.push(userObjectId as any);
      book.communityStats.totalLikes += 1;
    }

    return book.save();
  }

  async getLikedBooks(userId: string) {
    return this.bookModel.find({ 
      likes: { $in: [new mongoose.Types.ObjectId(userId)] } 
    })
    .select('title author book_image description communityStats primary_isbn13 nytBookId')
    .exec();
  }

  async isBookLiked(bookIdentifier: string, userId: string): Promise<boolean> {
    const book = await this.bookModel.findOne({
      $or: [
        { _id: bookIdentifier },
        { primary_isbn13: bookIdentifier },
        { nytBookId: bookIdentifier }
      ],
      likes: { $in: [new mongoose.Types.ObjectId(userId)] }
    });
    return !!book;
  }

  async getBookByIdentifier(identifier: string) {
    return this.findBookByIdOrIsbn(identifier);
  }
}