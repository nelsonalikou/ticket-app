import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../database/models/ticket.entity';
import { User } from '../database/models/user.entity';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Retrieves a paginated list of tickets.
   * Includes creator and assignee information (only their IDs).
   *
   * @param page The page number (default: 1).
   * @param limit The number of items per page (default: 10, max: 100).
   * @returns An object containing the paginated ticket data and pagination metadata.
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Ticket[]; page: number; limit: number; total: number; totalPages: number }> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [tickets, total] = await this.ticketsRepository.findAndCount({
      skip: skip,
      take: take,
      order: { createdAt: 'DESC' },
      relations: ['creator', 'assignee'],
      // loadRelationIds: { relations: ['creator', 'assignee'] },
    });

    const totalPages = Math.ceil(total / take);

    return {
      data: tickets,
      page: page,
      limit: take,
      total: total,
      totalPages: totalPages,
    };
  }

  /**
   * Retrieves a single ticket by its ID.
   * Throws NotFoundException if the ticket does not exist.
   *
   * @param id The ID of the ticket to retrieve.
   * @returns The ticket with the specified ID, including creator and assignee information.
   */
  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['creator', 'assignee'],
    });
    if (!ticket) throw new NotFoundException(`Ticket with id ${id} not found`);
    return ticket;
  }

  /**
   * Creates a new ticket with the provided details.
   * Throws NotFoundException if the creator or assignee user does not exist.
   *
   * @param title The title of the ticket.
   * @param description The description of the ticket.
   * @param creatorId The ID of the user creating the ticket.
   * @param assigneeId Optional ID of the user assigned to the ticket.
   * @returns The created ticket.
   */
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

  /**
   * Updates the status of a ticket by its ID.
   * Throws NotFoundException if the ticket does not exist.
   *
   * @param id The ID of the ticket to update.
   * @param status The new status to set for the ticket.
   * @returns The updated ticket.
   */
  async updateStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.status = status;
    return this.ticketsRepository.save(ticket);
  }

  /**
   * Deletes a ticket by its ID.
   * Throws NotFoundException if the ticket does not exist.
   *
   * @param id The ID of the ticket to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  async delete(id: number): Promise<void> {
    const result = await this.ticketsRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Ticket with id ${id} not found`);
  }

  /**
   * Deletes multiple tickets based on a list of IDs.
   * This method is intended to be called by a RabbitMQ message consumer.
   *
   * @param ids An array of ticket IDs to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  @MessagePattern('bulk_delete_tickets')
  async bulkDeleteTickets(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      console.warn('Received bulk delete request with no IDs. Skipping.');
      return;
    }

    try {
      const result = await this.ticketsRepository.delete({ id: In(ids) });
      console.log(`Bulk deletion successful for IDs: ${ids.join(', ')}. Affected rows: ${result.affected}`);
    } catch (error) {
      console.error(`Error during bulk deletion for IDs: ${ids.join(', ')}`, error.stack);
    }
  }
}
