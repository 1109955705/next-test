import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import {
  LoggerMiddleware,
  LoggingInterceptor,
  logger,
} from '@/common/middlewares/logger.middlewar';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  ResponseInterceptor,
} from '@/common/interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json()); // 为了中间件也能解析 application/json
  app.use(express.urlencoded({ extended: true })); // 为了中间件也能解析 application/x-www-form-urlencoded
  app.use(logger); // 日志记录中件间
  app.useGlobalFilters(new AnyExceptionFilter()); // 拦截未知错误
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );
  // app.useGlobalFilters(new AnyExceptionFilter(), new HttpExceptionFilter()); // 拦截请求回复
  await app.listen(3000);
}

bootstrap();
