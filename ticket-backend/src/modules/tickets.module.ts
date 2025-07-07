import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../database/models/ticket.entity';
import { User } from '../database/models/user.entity';
import { TicketController } from '../controllers/ticket.controller.spec';
import { TicketConsumerListener } from 'src/rabbitmq/rabbitmq.listener';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User]),
    RabbitMQModule,
  ],
  providers: [TicketService],
  controllers: [TicketController, TicketConsumerListener],
  exports: [TicketService],
})
export class TicketModule {}
