import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API for managing blog posts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Add global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties not in DTOs
      forbidNonWhitelisted: true, // Reject requests with unknown properties
      transform: true, // Convert input to match DTO types
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

