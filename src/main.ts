import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  
  const allowedOrigins = isProduction 
    ? [
        // 'https://your-frontend-app.vercel.app', // Production frontend URL - THAY BẰNG URL THẬT
        'http://localhost:5173' // Vẫn cho phép localhost để test
      ]
    : [
        'http://localhost:5173',
        'http://localhost:3000',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, postman, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('🚫 Blocked by CORS:', origin);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    credentials: true, // ⬅️ QUAN TRỌNG: cho phép gửi cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Session configuration
  app.use(
    session({
      name: 'sid',
      secret: process.env.SESSION_SECRET || 'kElQAyEpvvFYU4jGJpkSwhgIwMyvrBcCHMhxPUTWeuPUOnfWCq',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: isProduction, // true trên production, false trên development
        sameSite: isProduction ? 'none' : 'lax', // 'none' trên production, 'lax' trên development
      },
    }),
  );

  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`✅ CORS enabled for origins:`, allowedOrigins);
}

bootstrap();