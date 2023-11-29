import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { BooksModule } from './modules/books/books.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import entities from './index.entity';
import {APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './common/exceptions/http.exception';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_URL') || 'postgres://postgres:password@postgres:5432/book-store',
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    BooksModule],
  controllers: [AppController],
  providers: [
    AppService, 
    { 
      provide: APP_FILTER, 
      useClass: HttpExceptionFilter, 
    },],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // create logs for every incoming request
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
