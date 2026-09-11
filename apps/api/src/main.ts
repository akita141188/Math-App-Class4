import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const webOrigin = config.get<string>('app.webOrigin', 'http://localhost:5173');
  const port = config.get<number>('app.port', 3000);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: webOrigin });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const documentConfig = new DocumentBuilder()
    .setTitle('Math App Class 4 API')
    .setDescription('Mock REST API for the guided Grade 4 math tutor foundation.')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}

void bootstrap();
