process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'dev_only_do_not_use_in_prod';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fitur validasi data otomatis dari Kak Anggi
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Fitur dokumentasi API Swagger dari Kak Anggi
  const config = new DocumentBuilder()
    .setTitle('Kanban Task Tracking API')
    .setDescription('REST API for the Kanban task tracking application')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  // 1. Buka Pintu CORS untuk Frontend Vercel dan Lokal
  app.enableCors({
    origin: [
      'https://kanban-task-project.vercel.app',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  app.use(cookieParser());

  // 2. Gunakan port dinamis dari Railway atau fallback ke 8001 untuk lokal
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
