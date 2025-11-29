import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true, minlength: 3, maxlength: 30 })
  username: string;

  @Prop({ 
    required: true, 
    unique: true, 
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  })
  email: string;

  @Prop({ required: true, minlength: 6, select: false }) 
  password: string;

  @Prop({ default: '/images/default-avatar.png' })
  avatar: string;

  @Prop({ maxlength: 500 })
  bio: string;

  @Prop([{ type: String }])
  favoriteGenres: string[];

  @Prop({
    type: {
      booksReviewed: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 }
    },
    _id: false,
    default: () => ({
      booksReviewed: 0,
      totalRatings: 0,
      averageRating: 0
    })
  })
  readingStats: {
    booksReviewed: number;
    totalRatings: number;
    averageRating: number;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);