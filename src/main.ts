// main.ts - Cách đơn giản nhất
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  
  app.enableCors({
    origin: isProduction 
      ? 'https://your-frontend-app.vercel.app' // Production
      : 'http://localhost:5173', // Development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use(
    session({
      name: 'sid',
      secret: process.env.SESSION_SECRET || 'kElQAyEpvvFYU4jGJpkSwhgIwMyvrBcCHMhxPUTWeuPUOnfWCq',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();