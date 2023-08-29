import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // set prefix for all routes
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.VALID_ORIGIN,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
