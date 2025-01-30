import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DelayMiddleware } from './delay.middleware';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Create a write stream (in append mode)
  const logStream = fs.createWriteStream('permissions.log', { flags: 'a' });

  // Override console.log and console.warn to write to file
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = function (...args) {
    logStream.write(args[0] + '\n');
    originalLog.apply(console, args);
  };

  console.warn = function (...args) {
    logStream.write('[WARN] ' + args[0] + '\n');
    originalWarn.apply(console, args);
  };

  app.useGlobalPipes(
    new ValidationPipe({
      // Strips out any properties that are not part of the DTO
      whitelist: true,

      // Throws an error if any properties that are not part of the DTO are present in the request
      forbidNonWhitelisted: true,

      // Automatically transforms input data types to match the types defined in the DTO
      transform: true,

      transformOptions: {
        // Enables implicit type conversion, so strings can be automatically converted to numbers, booleans, etc.
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV === 'development') {
    app.use(new DelayMiddleware().use);
  }

  await app.listen(3000);
}
bootstrap();
