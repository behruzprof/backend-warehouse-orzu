import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  const PORT = process.env.PORT as string;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(PORT, () => {
    Logger.log(`SERVER STARTED ON 5000`);
  });
}
bootstrap();
