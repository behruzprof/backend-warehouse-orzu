import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // проверьте путь
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Явно указываем, что используем Express под капотом
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. ОЧЕНЬ ВАЖНО ДЛЯ RAILWAY: доверяем прокси-серверу
  app.set('trust proxy', 1);

  // 2. Агрессивная настройка CORS
  app.enableCors({
    // origin: true заставляет сервер брать origin из запроса и отвечать им же.
    // Это обходит проблемы со слэшами на конце URL или неточным совпадением
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: true,
  });

  const PORT = process.env.PORT || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(PORT, () => {
    Logger.log(`SERVER STARTED ON ${PORT}`);
  });
}
bootstrap();