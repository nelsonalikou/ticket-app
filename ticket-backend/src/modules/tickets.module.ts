import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../database/models/ticket.entity';
import { User } from '../database/models/user.entity';
import { TicketController } from '../controllers/ticket.controller.spec';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User])],
  providers: [TicketService],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
