// src/auth/auth.controller.ts
import { Controller, Post, Put, Body, Param, Session, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any, @Session() session: any) {
    const { username, email, password } = body;
    const result = await this.authService.register(username, email, password);
    
    session.user = result.user;
    return result;
  }

  @Post('login') 
  async login(@Body() body: any, @Session() session: any) {
    const { email, password } = body;
    const result = await this.authService.login(email, password);
    
    session.user = result.user;
    return result;
  }

  @Post('logout')
  async logout(@Session() session: any) {
    session.user = null;
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getCurrentUser(@Session() session: any) {
    if (!session.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return { user: session.user };
  }

  @Put('change-password/:userId')
  async changePassword(@Param('userId') userId: string, @Body() body: any, @Session() session: any) {
    if (!session.user || session.user._id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }
    const { currentPassword, newPassword } = body;
    return this.authService.changePassword(userId, currentPassword, newPassword);
  }
}