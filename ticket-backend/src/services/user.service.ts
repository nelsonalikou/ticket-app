import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['createdTickets', 'assignedTickets'],
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['createdTickets', 'assignedTickets'],
    });
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
