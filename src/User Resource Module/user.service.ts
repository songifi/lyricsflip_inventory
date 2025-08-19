import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, FindManyOptions, FindOptionsWhere } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, UserStatus } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { UserNotFoundException } from "./exceptions/user-not-found.exception";
import { UserAlreadyExistsException } from "./exceptions/user-already-exists.exception";

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    // Check if user already exists
    await this.checkUserExists(createUserDto.email, createUserDto.username);

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUsers> {
    const { page, limit, search, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    // Build find options
    const findOptions: FindManyOptions<User> = {
      where,
      skip,
      take: limit,
      order: this.buildSortOptions(sortBy, sortOrder),
    };

    // Apply search
    if (search) {
      findOptions.where = [
        { ...where, firstName: Like(`%${search}%`) },
        { ...where, lastName: Like(`%${search}%`) },
        { ...where, email: Like(`%${search}%`) },
        { ...where, username: Like(`%${search}%`) },
      ];
    }

    const [users, total] = await this.userRepository.findAndCount(findOptions);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for conflicts if email or username is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserByEmail = await this.findByEmail(updateUserDto.email);
      if (existingUserByEmail) {
        throw new UserAlreadyExistsException("email", updateUserDto.email);
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUserByUsername = await this.findByUsername(
        updateUserDto.username
      );
      if (existingUserByUsername) {
        throw new UserAlreadyExistsException(
          "username",
          updateUserDto.username
        );
      }
    }

    Object.assign(user, updateUserDto);

    try {
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User updated successfully with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    try {
      await this.userRepository.remove(user);
      this.logger.log(`User deleted successfully with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}: ${error.message}`);
      throw error;
    }
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.ACTIVE;

    try {
      const activatedUser = await this.userRepository.save(user);
      this.logger.log(`User activated successfully with ID: ${id}`);
      return activatedUser;
    } catch (error) {
      this.logger.error(`Failed to activate user ${id}: ${error.message}`);
      throw error;
    }
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.INACTIVE;

    try {
      const deactivatedUser = await this.userRepository.save(user);
      this.logger.log(`User deactivated successfully with ID: ${id}`);
      return deactivatedUser;
    } catch (error) {
      this.logger.error(`Failed to deactivate user ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  private async checkUserExists(
    email: string,
    username: string
  ): Promise<void> {
    const existingUserByEmail = await this.findByEmail(email);
    if (existingUserByEmail) {
      throw new UserAlreadyExistsException("email", email);
    }

    const existingUserByUsername = await this.findByUsername(username);
    if (existingUserByUsername) {
      throw new UserAlreadyExistsException("username", username);
    }
  }

  private buildSortOptions(
    sortBy: string[],
    sortOrder: "asc" | "desc"
  ): Record<string, "ASC" | "DESC"> {
    const order: Record<string, "ASC" | "DESC"> = {};

    if (sortBy && sortBy.length > 0) {
      sortBy.forEach((field) => {
        order[field] = sortOrder.toUpperCase() as "ASC" | "DESC";
      });
    } else {
      order.createdAt = "DESC";
    }

    return order;
  }
}
