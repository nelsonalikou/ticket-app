import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TicketService } from '../services/ticket.service';


@Controller()
export class TicketConsumerListener {
  constructor(private readonly ticketService: TicketService) {}

  @EventPattern(process.env.RABBITMQ_TICKETS_QUEUE_NAME)
  async handleBulkDelete(@Payload() ids: number[]) {
    Logger.log(`Received deletion request for IDs: ${ids.join(', ')}`);
    await this.ticketService.bulkDeleteTickets(ids);
  }
}