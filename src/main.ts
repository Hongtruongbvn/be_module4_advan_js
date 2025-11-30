import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Optional: if you need raw body
  });

  // ⚠️ QUAN TRỌNG: Trust proxy for Render - Cách NestJS
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Dynamic CORS origin
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app', // Thay bằng frontend URL thực tế
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Dynamic session config
  app.use(
    session({
      name: 'sid',
      secret: process.env.SESSION_SECRET || 'kElQAyEpvvFYU4jGJpkSwhgIwMyvrBcCHMhxPUTWeuPUOnfWCq',
      resave: false,
      saveUninitialized: false,
      proxy: isProduction, // ⬅️ QUAN TRỌNG: enable trust proxy for session
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction, // Production: true, Development: false
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();