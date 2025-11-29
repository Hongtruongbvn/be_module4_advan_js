import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  book: string;

  @Prop({ required: true, maxlength: 2000 })
  content: string;

  @Prop([{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }])
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop([{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }
  }])
  replies: Array<{
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);