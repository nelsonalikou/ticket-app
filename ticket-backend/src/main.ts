import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env?.CORS_ALLOWED_ORIGINS,
    methods: env?.CORS_ALLOWED_METHODS,
    credentials: (/true/).test(env?.CORS_ALLOWED_CREDENTIALS),
  });

  const config = new DocumentBuilder()
    .setTitle('Ticket API')
    .setDescription('API documentation for the ticketing system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
