import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../database/models/ticket.entity';
import { User } from '../database/models/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find();
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) throw new NotFoundException(`Ticket with id ${id} not found`);
    return ticket;
  }

  async create(
    title: string,
    description: string,
    creatorId: number,
    assigneeId?: number,
  ): Promise<Ticket> {
    const creator = await this.usersRepository.findOneBy({ id: creatorId });
    if (!creator)
      throw new NotFoundException(`Creator user ${creatorId} not found`);

    let assignee: User = null;
    if (assigneeId) {
      assignee = await this.usersRepository.findOneBy({ id: assigneeId });
      if (!assignee)
        throw new NotFoundException(`Assignee user ${assigneeId} not found`);
    }

    const ticket = this.ticketsRepository.create({
      title,
      description,
      creator,
      assignee,
      status: TicketStatus.OPEN,
    });

    return this.ticketsRepository.save(ticket);
  }

  async updateStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.status = status;
    return this.ticketsRepository.save(ticket);
  }

  async delete(id: number): Promise<void> {
    const result = await this.ticketsRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Ticket with id ${id} not found`);
  }
}
