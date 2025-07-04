import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../database/models/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail, IsOptional, IsDefined } from 'class-validator';

// --- DTOs (Data Transfer Objects) for Swagger Documentation ---

// DTO for creating a new user
export class CreateUserDto {
  @ApiProperty({
    description: 'The full name of the user.',
    example: 'John Doe',
  })
  @IsDefined()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email address of the user. Must be unique.',
    example: 'john.doe@example.com',
  })
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'An optional age for the user.',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  age?: number;
}

// DTO for updating an existing user
// All fields are optional as you might only update a subset of user data
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'The full name of the user.',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user. Must be unique.',
    example: 'jane.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'An optional age for the user.',
    example: 32,
  })
  @IsOptional()
  @IsNumber()
  age?: number;
}

// DTO for the User entity response.
export class UserDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user.' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'The full name of the user.' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user.' })
  email: string;

  @ApiPropertyOptional({ example: 30, description: 'The age of the user (optional).' })
  age?: number;

  @ApiProperty({ example: '2023-01-15T14:30:00.000Z', description: 'The date and time the user was created.' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-15T15:00:00.000Z', description: 'The date and time the user was last updated.' })
  updatedAt: Date;
}


@ApiTags('Users')
@Controller('users')
/**
 * Controller responsible for handling user-related HTTP requests.
 *
 * Provides endpoints to create, retrieve, update, and delete users.
 * Each method is mapped to a specific route and HTTP verb, and delegates
 * business logic to the injected UserService.
 *
 * @remarks
 * This controller includes endpoints for:
 * - Creating a new user
 * - Retrieving all users
 * - Retrieving a user by their ID
 * - Updating an existing user
 * - Deleting a user by their ID
 *
 * @see UserService
 */
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user', description: 'Registers a new user with their name and email. Age is optional.' })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data required to create a new user.',
    examples: {
      'Basic User Creation': {
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
      'User with Age': {
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 28,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data provided (e.g., duplicate email, invalid format).' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users', description: 'Returns a list of all users available in the system.' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a list of users.',
    type: [UserDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID', description: 'Returns a single user based on their unique identifier.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the user to retrieve.',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user.',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'User with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user', description: 'Updates the details of an existing user based on their ID. Any provided fields will be updated.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the user to update.',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The fields to update for the user.',
    examples: {
      'Update Name and Age': {
        value: {
          name: 'John Doe',
          age: 35,
        },
      },
      'Update Email Only': {
        value: {
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'User with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or ID format.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID', description: 'Deletes a user permanently from the system using their unique identifier.' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the user to delete.',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User with the specified ID not found.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
