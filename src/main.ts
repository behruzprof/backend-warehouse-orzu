import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const PORT = process.env.PORT as string

  await app.listen(PORT, () => {
    Logger.log(`SERVER STARTED ON 5000`)
  });
}
bootstrap();
