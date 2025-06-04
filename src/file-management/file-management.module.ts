import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FileManagementService } from "./file-management.service";
import { FileManagementController } from "./file-management.controller";
import { FileMetadata } from "./entities/file-metadata.entity";
import * as fs from "fs";
import * as path from "path";

@Module({
  imports: [
    TypeOrmModule.forFeature([FileMetadata]),
    MulterModule.register({
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${path.extname(
              file.originalname
            )}`
          );
        },
      }),
    }),
  ],
  controllers: [FileManagementController],
  providers: [FileManagementService],
  exports: [FileManagementService],
})
export class FileManagementModule {
  constructor() {
    this.ensureUploadsDirectories();
  }

  private ensureUploadsDirectories() {
    const directories = [
      "./uploads",
      "./uploads/products",
      "./uploads/documents",
      "./uploads/misc",
    ];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}
