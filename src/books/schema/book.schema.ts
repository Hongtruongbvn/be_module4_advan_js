// src/books/schema/book.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "user", required: true })
  userId: mongoose.Schema.Types.ObjectId;
  
  @Prop({ required: true, unique: true })
  nytBookId: string;

  @Prop({ required: true, unique: true, index: true }) // Thêm index
  primary_isbn13: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  description: string;

  @Prop()
  book_image: string;

  @Prop()
  amazon_product_url: string;

  @Prop({
    type: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalVotes: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 }
    },
    _id: false,
    default: {
      averageRating: 0,
      totalReviews: 0,
      totalVotes: 0,
      totalLikes: 0
    }
  })
  communityStats: {
    averageRating: number;
    totalReviews: number;
    totalVotes: number;
    totalLikes: number;
  };

  @Prop([{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  }])
  ratings: Array<{
    userId: mongoose.Schema.Types.ObjectId;
    rating: number;
  }>;

  @Prop([{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }])
  likes: mongoose.Schema.Types.ObjectId[];
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ primary_isbn13: 1, nytBookId: 1 });