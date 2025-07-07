import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ClientsModule.registerAsync([
            {
                name: 'TICKET_SERVICE_QUEUE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => {
                    const queueName = configService.get<string>('RABBITMQ_TICKETS_QUEUE_NAME');
                    const rabbitUrl = configService.get<string>('RABBITMQ_URL');

                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [rabbitUrl],
                            queue: queueName,
                        },
                    };
                },
                inject: [ConfigService],
            },
        ]),
    ],
    exports: [
        ClientsModule
    ],
})
export class RabbitMQModule { }
