import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const categoryData: Partial<Category> = { ...createCategoryDto };

    if (createCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findById(
        createCategoryDto.parentId
      );
      if (!parent) {
        throw new NotFoundException("Parent category not found");
      }
      categoryData.parent = parent;
    }

    return this.categoriesRepository.create(categoryData);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoriesRepository.findRootCategories();
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.findOne(id);
    const updateData: Partial<Category> = { ...updateCategoryDto };

    if (updateCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findById(
        updateCategoryDto.parentId
      );
      if (!parent) {
        throw new NotFoundException("Parent category not found");
      }
      updateData.parent = parent;
    }

    return this.categoriesRepository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.delete(id);
  }
}
