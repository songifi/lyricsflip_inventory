import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  StreamableFile,
  Header,
  ParseEnumPipe,
  ParseUUIDPipe,
  Res,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileManagementService } from "./file-management.service";
import { FileMetadata, FileCategory } from "./entities/file-metadata.entity";
import * as mime from "mime-types";

@Controller("files")
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @Post("upload")
  @UseInterceptors(FilesInterceptor("files", 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query("category", new ParseEnumPipe(FileCategory)) category: FileCategory,
    @Query("entityId") entityId?: string,
    @Query("entityType") entityType?: string,
    @Body("metadata") metadata?: string
  ): Promise<FileMetadata[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

    let parsedMetadata: Record<string, any> | undefined;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        throw new BadRequestException("Invalid metadata JSON");
      }
    }

    const results: FileMetadata[] = [];

    for (const file of files) {
      if (category === FileCategory.PRODUCT_IMAGE) {
        const processedPath = await this.fileManagementService.processImage(
          file,
          {
            width: 800,
            height: 800,
            quality: 80,
            format: "webp",
          }
        );
        file.path = processedPath;
        file.filename = processedPath.split("/").pop()!;
      }

      const fileMetadata = await this.fileManagementService.saveFileMetadata(
        file,
        category,
        entityId,
        entityType,
        parsedMetadata
      );
      results.push(fileMetadata);
    }

    return results;
  }

  @Get()
  async findAll(
    @Query("category", new ParseEnumPipe(FileCategory, { optional: true }))
    category?: FileCategory
  ): Promise<FileMetadata[]> {
    return this.fileManagementService.findAll(category);
  }

  @Get("by-entity/:entityType/:entityId")
  async findByEntity(
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("entityType") entityType: string
  ): Promise<FileMetadata[]> {
    return this.fileManagementService.findByEntity(entityId, entityType);
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<FileMetadata> {
    return this.fileManagementService.findOne(id);
  }

  @Get(":id/download")
  @Header("Content-Disposition", "attachment")
  async download(
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const file = await this.fileManagementService.findOne(id);
    const stream = await this.fileManagementService.createReadStream(id);

    res.set({
      "Content-Type":
        file.mimeType ||
        mime.lookup(file.filename) ||
        "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        file.originalName
      )}"`,
      "Content-Length": file.size,
    });

    return new StreamableFile(stream);
  }

  @Get(":id/stream")
  @Header("Content-Type", "application/octet-stream")
  async stream(
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const file = await this.fileManagementService.findOne(id);
    const stream = await this.fileManagementService.createReadStream(id);

    res.set({
      "Content-Type":
        file.mimeType ||
        mime.lookup(file.filename) ||
        "application/octet-stream",
      "Content-Length": file.size,
      "Accept-Ranges": "bytes",
    });

    return new StreamableFile(stream);
  }

  @Patch(":id")
  async updateMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Body()
    updates: {
      metadata?: Record<string, any>;
      category?: FileCategory;
      isActive?: boolean;
    }
  ): Promise<FileMetadata> {
    return this.fileManagementService.updateMetadata(id, updates);
  }

  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.fileManagementService.delete(id);
  }
}
