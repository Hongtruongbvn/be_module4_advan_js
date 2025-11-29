import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments/schema/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async findByBook(bookIdentifier: string) {
    return this.commentModel.find({ book: bookIdentifier })
      .populate('user', 'username avatar')
      .populate('likes', 'username avatar')
      .populate('replies.user', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return this.commentModel.find({ user: userId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(commentData: any) {
    const comment = new this.commentModel(commentData);
    return comment.save();
  }

  async update(id: string, updateData: any, userId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    
    if (comment.user.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to update this comment');
    }

    const updated = await this.commentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
    
    return updated;
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    
    if (comment.user.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to delete this comment');
    }

    const deleted = await this.commentModel.findByIdAndDelete(id).exec();
    return deleted;
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const userIndex = comment.likes.findIndex(
      likeUserId => likeUserId.toString() === userId
    );

    if (userIndex > -1) {
      comment.likes.splice(userIndex, 1);
    } else {
      comment.likes.push(userId as any);
    }

    return comment.save();
  }

  async addReply(commentId: string, userId: string, content: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    comment.replies.push({
      user: userId as any,
      content,
      createdAt: new Date()
    });

    return comment.save();
  }

  async deleteReply(commentId: string, replyIndex: number, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (replyIndex < 0 || replyIndex >= comment.replies.length) {
      throw new NotFoundException('Reply not found');
    }

    const reply = comment.replies[replyIndex];
    if (reply.user.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to delete this reply');
    }

    comment.replies.splice(replyIndex, 1);
    return comment.save();
  }
}