import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FileMetadata, FileCategory } from "./entities/file-metadata.entity";
import * as fs from "fs";
import * as path from "path";
import * as sharp from "sharp";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

@Injectable()
export class FileManagementService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileMetadataRepository: Repository<FileMetadata>
  ) {}

  async saveFileMetadata(
    file: Express.Multer.File,
    category: FileCategory,
    relatedEntityId?: string,
    relatedEntityType?: string,
    additionalMetadata?: Record<string, any>
  ): Promise<FileMetadata> {
    const metadata = this.fileMetadataRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      category,
      relatedEntityId,
      relatedEntityType,
      metadata: additionalMetadata,
    });

    return await this.fileMetadataRepository.save(metadata);
  }

  async processImage(
    file: Express.Multer.File,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: "jpeg" | "png" | "webp";
    } = {}
  ): Promise<string> {
    const { width, height, quality = 80, format = "webp" } = options;
    const outputFilename = `${path.parse(file.filename).name}.${format}`;
    const outputPath = path.join(path.dirname(file.path), outputFilename);

    await sharp(file.path)
      .resize(width, height, {
        fit: "cover",
        withoutEnlargement: true,
      })
      [format]({ quality })
      .toFile(outputPath);

    // Delete the original file if it's different from the processed one
    if (file.path !== outputPath) {
      await fs.promises.unlink(file.path);
    }

    return outputPath;
  }

  async findAll(category?: FileCategory): Promise<FileMetadata[]> {
    const query = this.fileMetadataRepository.createQueryBuilder("file");

    if (category) {
      query.where("file.category = :category", { category });
    }

    return query.orderBy("file.createdAt", "DESC").getMany();
  }

  async findOne(id: string): Promise<FileMetadata> {
    const file = await this.fileMetadataRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async findByEntity(
    entityId: string,
    entityType: string
  ): Promise<FileMetadata[]> {
    return this.fileMetadataRepository.find({
      where: {
        relatedEntityId: entityId,
        relatedEntityType: entityType,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const file = await this.findOne(id);

    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      console.error(`Error deleting file ${file.path}:`, error);
    }

    await this.fileMetadataRepository.remove(file);
  }

  async createReadStream(fileId: string): Promise<fs.ReadStream> {
    const file = await this.findOne(fileId);

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException("File not found on disk");
    }

    return fs.createReadStream(file.path);
  }

  async updateMetadata(
    id: string,
    updates: Partial<Pick<FileMetadata, "metadata" | "category" | "isActive">>
  ): Promise<FileMetadata> {
    const file = await this.findOne(id);
    Object.assign(file, updates);
    return this.fileMetadataRepository.save(file);
  }
}
