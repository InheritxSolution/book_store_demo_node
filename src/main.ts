import {ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http.exception';
import { CustomLogger } from './common/logger/custom-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  // Use custom http exception filter to catch global exception
  app.useGlobalFilters(new HttpExceptionFilter());

  // For validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(new ConfigService().get('PORT'));
}

bootstrap();
