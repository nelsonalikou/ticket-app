import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  Logger,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { TicketStatus } from '../database/models/ticket.entity';
import {
  ApiTags,
  ApiProperty,
  ApiPropertyOptional,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDefined } from 'class-validator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { BulkDeleteTicketsDto } from '../common/dtos/bulk-delete.dto';
import { ClientProxy } from '@nestjs/microservices';

// --- DTOs (Data Transfer Objects) for Swagger Documentation ---

// DTO for creating a new ticket
export class CreateTicketDto {
  @ApiProperty({
    description: 'The title of the ticket.',
    example: 'Fix authentication issue on login page',
  })
  @IsDefined()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the ticket.',
    example: 'Users are reporting that they cannot log in after recent update.',
  })
  @IsDefined()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The ID of the user who created this ticket.',
    example: 101,
  })
  @IsDefined()
  @IsNumber()
  creatorId: number;

  @ApiPropertyOptional({
    description: 'The ID of the user assigned to this ticket (optional).',
    example: 205,
  })
  @IsOptional()
  @IsNumber()
  assigneeId?: number;
}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'The new status to set for the ticket.',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
  })
  @IsDefined()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class Ticket {
  @ApiProperty({ example: 1, description: 'The unique identifier of the ticket.' })
  id: number;

  @ApiProperty({ example: 'Bug in payment gateway', description: 'The title of the ticket.' })
  title: string;

  @ApiProperty({
    example: 'Customers are unable to complete purchases due to an error in the payment processing.',
    description: 'A detailed description of the ticket.',
  })
  description: string;

  @ApiProperty({
    example: TicketStatus.OPEN,
    enum: TicketStatus,
    description: 'The current status of the ticket.',
  })
  status: TicketStatus;

  @ApiProperty({ example: 10, description: 'The ID of the user who created the ticket.' })
  creatorId: number;

  @ApiPropertyOptional({ example: 5, description: 'The ID of the user assigned to the ticket (optional).' })
  assigneeId?: number;

  @ApiProperty({ example: '2023-10-26T10:00:00.000Z', description: 'The date and time the ticket was created.' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-26T11:30:00.000Z', description: 'The date and time the ticket was last updated.' })
  updatedAt: Date;
}

export class PaginatedTicketDto {
  @ApiProperty({ type: [Ticket], description: 'Array of tickets for the current page.' })
  data: Ticket[];

  @ApiProperty({ example: 1, description: 'Current page number.' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page.' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total number of tickets available.' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total number of pages.' })
  totalPages: number;
}



// --- Controller Definition ---

@ApiTags('Tickets')
@Controller('tickets')
/**
 * Controller responsible for handling ticket-related HTTP requests.
 *
 * Provides endpoints to retrieve, create, update, and delete tickets.
 * Each method is mapped to a specific route and HTTP verb, and delegates
 * business logic to the injected TicketService.
 *
 * @remarks
 * This controller includes endpoints for:
 * - Retrieving all tickets
 * - Retrieving a ticket by its ID
 * - Creating a new ticket
 * - Updating the status of a ticket
 * - Deleting a ticket by its ID
 * - Deleting multiple tickets in bulk via RabbitMQ
 *
 * @see TicketService
 */
@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    @Inject('TICKET_SERVICE_QUEUE') private client: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tickets with pagination',
    description: 'Returns a paginated list of all tickets available in the system.',
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a paginated list of tickets.',
    type: PaginatedTicketDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    Logger.log(`Request to retrieve tickets: page=${page}, limit=${limit}`);
    return this.ticketService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a ticket by ID', description: 'Returns a single ticket based on its unique identifier.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the ticket to retrieve.',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the ticket.',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    Logger.log(`Request to retrieve ticket with ID: ${id}`);
    return this.ticketService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket', description: 'Creates a new ticket with the provided details and assigns it to a creator. An assignee can optionally be provided.' })
  @ApiBody({
    type: CreateTicketDto,
    description: 'The data required to create a new ticket.',
    examples: {
      'Basic Ticket': {
        value: {
          title: 'Database connection issue',
          description: 'The application is unable to connect to the production database.',
          creatorId: 1,
        },
      },
      'Assigned Ticket': {
        value: {
          title: 'UI bug on dashboard',
          description: 'Dashboard cards are overlapping on smaller screens.',
          creatorId: 2,
          assigneeId: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The ticket has been successfully created.',
    type: Ticket,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data provided.' })
  async create(@Body() createTicketDto: CreateTicketDto) {
    const { title, description, creatorId, assigneeId } = createTicketDto;
    Logger.log(`Request to create a new ticket: ${title} by user ID: ${creatorId}`);
    return this.ticketService.create(title, description, creatorId, assigneeId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of a ticket', description: 'Changes the status of an existing ticket based on its ID.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the ticket to update.',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateStatusDto,
    description: 'The new status for the ticket.',
    examples: {
      'Set to In Progress': {
        value: { status: TicketStatus.IN_PROGRESS },
      },
      'Set to Done': {
        value: { status: TicketStatus.DONE },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket status has been successfully updated.',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid status provided or ID format.' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    Logger.log(`Request to update status of ticket with ID: ${id} to ${updateStatusDto.status}`);
    return this.ticketService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket by ID', description: 'Deletes a ticket permanently from the system using its unique identifier.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the ticket to delete.',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Ticket with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    Logger.log(`Request to delete ticket with ID: ${id}`);
    return this.ticketService.delete(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Initiate bulk deletion of tickets',
    description: 'Sends a request to delete a list of tickets asynchronously via RabbitMQ. The actual deletion happens in a background task.',
  })
  @ApiBody({
    type: BulkDeleteTicketsDto,
    description: 'A list of ticket IDs to be deleted in bulk.',
    examples: {
      'Delete multiple tickets': {
        value: { ids: [2, 3, 4] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Bulk deletion request accepted and sent to background queue. No immediate response for individual deletions.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data provided (e.g., empty array or non-numeric IDs).' })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteTicketsDto) {
    // Emit the message to the RabbitMQ queue
    Logger.log(`Bulk delete request for IDs: ${bulkDeleteDto.ids.join(', ')} sent to RabbitMQ.`);
    this.client.emit(process.env.RABBITMQ_TICKETS_QUEUE_NAME, bulkDeleteDto.ids);
    return {
      message: 'Bulk delete request accepted and queued for processing.',
      ids: bulkDeleteDto.ids,
    };
  }
}
