import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { User } from "./user.entity";
import { plainToClass } from "class-transformer";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  @ApiConflictResponse({ description: "User already exists" })
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all users with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/UserResponseDto" },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String, example: "john" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["active", "inactive", "pending"],
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    example: "createdAt",
  })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["asc", "desc"] })
  async findAll(@Query(ValidationPipe) query: UserQueryDto) {
    const result = await this.userService.findAll(query);
    return {
      ...result,
      data: result.data.map((user) =>
        plainToClass(UserResponseDto, user, { excludeExtraneousValues: true })
      ),
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: "User not found" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Email or username already exists" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, updateUserDto);
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.remove(id);
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Activate user account" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({
    status: 200,
    description: "User activated successfully",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: "User not found" })
  async activate(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    const user = await this.userService.activate(id);
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id/deactivate")
  @ApiOperation({ summary: "Deactivate user account" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({
    status: 200,
    description: "User deactivated successfully",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: "User not found" })
  async deactivate(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    const user = await this.userService.deactivate(id);
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
