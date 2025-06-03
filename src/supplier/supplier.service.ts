import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, ILike } from "typeorm";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { SupplierQueryDto } from "./dto/supplier-query.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Supplier } from "./entities/supplier.entity";

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Check if email already exists
    const existingSupplier = await this.supplierRepository.findOne({
      where: { email: createSupplierDto.email },
    });

    if (existingSupplier) {
      throw new ConflictException("Supplier with this email already exists");
    }

    // Validate business rules
    this.validateSupplierData(createSupplierDto);

    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll(query: SupplierQueryDto) {
    const { search, city, country, isActive, page, limit, sortBy, sortOrder } =
      query;

    const queryBuilder = this.supplierRepository
      .createQueryBuilder("supplier")
      .leftJoinAndSelect("supplier.products", "products");

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        "(supplier.name ILIKE :search OR supplier.contactPerson ILIKE :search OR supplier.email ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (city) {
      queryBuilder.andWhere("supplier.city ILIKE :city", { city: `%${city}%` });
    }

    if (country) {
      queryBuilder.andWhere("supplier.country ILIKE :country", {
        country: `%${country}%`,
      });
    }

    if (typeof isActive === "boolean") {
      queryBuilder.andWhere("supplier.isActive = :isActive", { isActive });
    }

    // Apply sorting
    const allowedSortFields = [
      "name",
      "email",
      "city",
      "country",
      "createdAt",
      "updatedAt",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
    queryBuilder.orderBy(`supplier.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and count
    const [suppliers, total] = await queryBuilder.getManyAndCount();

    return {
      data: suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);

    // Check if email is being updated and if it conflicts with existing supplier
    if (updateSupplierDto.email && updateSupplierDto.email !== supplier.email) {
      const existingSupplier = await this.supplierRepository.findOne({
        where: { email: updateSupplierDto.email },
      });

      if (existingSupplier && existingSupplier.id !== id) {
        throw new ConflictException("Supplier with this email already exists");
      }
    }

    // Validate business rules
    this.validateSupplierData(updateSupplierDto);

    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Check if supplier has associated products
    if (supplier.products && supplier.products.length > 0) {
      throw new BadRequestException(
        "Cannot delete supplier with associated products. Remove products first or transfer them to another supplier."
      );
    }

    await this.supplierRepository.remove(supplier);
  }

  async deactivate(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    return await this.supplierRepository.save(supplier);
  }

  async activate(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.isActive = true;
    return await this.supplierRepository.save(supplier);
  }

  private validateSupplierData(
    supplierData: CreateSupplierDto | UpdateSupplierDto
  ): void {
    // Business rule: Name cannot be empty or just whitespace
    if (supplierData.name && supplierData.name.trim().length === 0) {
      throw new BadRequestException("Supplier name cannot be empty");
    }

    // Business rule: If phone is provided, it should follow a basic format
    if (
      supplierData.phone &&
      !/^[\+]?[0-9\s\-\(\)]+$/.test(supplierData.phone)
    ) {
      throw new BadRequestException("Invalid phone number format");
    }

    // Business rule: Website should be valid URL format if provided
    if (supplierData.website) {
      try {
        new URL(supplierData.website);
      } catch {
        throw new BadRequestException("Invalid website URL format");
      }
    }

    // Business rule: Postal code should be alphanumeric if provided
    if (
      supplierData.postalCode &&
      !/^[a-zA-Z0-9\s\-]+$/.test(supplierData.postalCode)
    ) {
      throw new BadRequestException("Invalid postal code format");
    }
  }
}
