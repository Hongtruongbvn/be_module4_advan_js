// src/comments/comments.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Session, UnauthorizedException } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('book/:bookId')
  findByBook(@Param('bookId') bookId: string) {
    return this.commentsService.findByBook(bookId);
  }

  @Get('user/my-comments')
  findMyComments(@Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to view your comments');
    }
    return this.commentsService.findByUser(session.user._id);
  }

  @Post()
  create(@Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to comment');
    }
    const commentData = {
      ...body,
      user: session.user._id
    };
    return this.commentsService.create(commentData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to update comments');
    }
    return this.commentsService.update(id, body, session.user._id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to delete comments');
    }
    return this.commentsService.delete(id, session.user._id);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to like comments');
    }
    return this.commentsService.toggleLike(id, session.user._id);
  }

  @Post(':id/reply')
  addReply(@Param('id') id: string, @Body() body: any, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to reply');
    }
    const { content } = body;
    return this.commentsService.addReply(id, session.user._id, content);
  }

  @Delete(':id/reply/:replyIndex')
  deleteReply(@Param('id') id: string, @Param('replyIndex') replyIndex: number, @Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Please login to delete replies');
    }
    return this.commentsService.deleteReply(id, parseInt(replyIndex.toString()), session.user._id);
  }
}