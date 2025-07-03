import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { TicketStatus } from '../database/models/ticket.entity';

class CreateTicket {
  title: string;
  description: string;
  creatorId: number;
  assigneeId?: number;
}

class UpdateStatus {
  status: TicketStatus;
}

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async findAll() {
    return this.ticketService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }

  @Post()
  async create(@Body() create: CreateTicket) {
    const { title, description, creatorId, assigneeId } = create;
    return this.ticketService.create(title, description, creatorId, assigneeId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatus: UpdateStatus,
  ) {
    return this.ticketService.updateStatus(id, updateStatus.status);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.delete(id);
  }
}
