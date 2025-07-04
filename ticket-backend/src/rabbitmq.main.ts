import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { env } from 'process';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.RMQ,
            options: {
                urls: [env?.RABBITMQ_URL],
                queue: env?.RABBITMQ_TICKETS_QUEUE_NAME,
            },
        }
    );
    app.listen();
    Logger.log(`RabbitMQ microservice is listening on queue: ${env?.RABBITMQ_TICKETS_QUEUE_NAME}`, 'RabbitMQ');
}
bootstrap();