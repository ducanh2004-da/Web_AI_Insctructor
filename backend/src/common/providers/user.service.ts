import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserInput, UpdateUserInput } from '../DTO/user/user.input';
import { UserResponse } from '../DTO/user/user.response';
import * as bcrypt from 'bcrypt';
import { IUserDAO } from '../interfaces/user.dao.interface';
import { UserDAO } from '../DAO/user.dao';
import { USER_DAO } from '../DAO/user.constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_DAO) private readonly userDAO: IUserDAO,
  ) {}

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userDAO.findAll();
    return users.map((user) => ({
      ...user,
      phoneNumber: user.phoneNumber ?? undefined, // Convert null to undefined
    }));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.userDAO.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      ...user,
      phoneNumber: user.phoneNumber ?? undefined,
    };
  }

  async create(data: CreateUserInput): Promise<UserResponse> {
    const existingUser = await this.userDAO.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userDAO.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber ?? undefined,
      role: 'user',
    });

    return {
      ...user,
      phoneNumber: user.phoneNumber ?? undefined,
    };
  }

  async update(data: UpdateUserInput): Promise<UserResponse> {
    const user = await this.userDAO.findOne(data.id);
    if (!user) {
      throw new NotFoundException(`User with ID ${data.id} not found`);
    }

    if (data.email) {
      const emailExists = await this.userDAO.findByEmail(data.email);
      if (emailExists && emailExists.id !== data.id) {
        throw new BadRequestException('Email already in use by another user');
      }
    }

    // Correct the way of calling the update function to pass the correct parameters
    const updatedUser = await this.userDAO.update(data.id, data);

    return {
      ...updatedUser,
      phoneNumber: updatedUser.phoneNumber ?? undefined,
    };
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userDAO.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userDAO.delete(id);
    return true;
  }
}