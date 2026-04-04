import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Updated CORS configuration
  app.enableCors({
    origin: ['https://pas.orzumedical.uz', "https://frontend-warehouse-orzumed.vercel.app"], // Explicitly allow your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies and authorization headers
    allowedHeaders: 'Content-Type, Accept, Authorization',
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