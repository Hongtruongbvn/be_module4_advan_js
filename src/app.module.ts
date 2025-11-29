import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { BooksModule } from './books/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://truongph124010123075_db_user:GoBtEg0MfqBaGXPJ@cluster0.jdoueh4.mongodb.net/?appName=Cluster0'),
    UsersModule,  
    CommentsModule, 
    BooksModule,
  AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
