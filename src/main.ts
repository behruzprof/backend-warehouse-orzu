import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Updated CORS configuration
  // app.enableCors({
  //   origin: function (origin, callback) {
  //     const allowedOrigins = [
  //       'https://pas.orzumedical.uz',
  //       'https://frontend-warehouse-orzumed.vercel.app',
  //       'http://localhost:5173', // Не забудьте локалхост для удобной разработки!
  //     ];

  //     // Разрешаем запросы без origin (например, из Postman) или если origin есть в списке
  //     if (!origin || allowedOrigins.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  //   allowedHeaders: 'Content-Type, Accept, Authorization, x-api-key',
  // });

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
