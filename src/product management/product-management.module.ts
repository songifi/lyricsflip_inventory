import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import { ProductController } from "./product-management.controller"
import { ProductService } from "./product-management.service"
import { Product } from "./entities/product.entity"
import { ProductImage } from "./entities/product-image.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    MulterModule.register({
      storage: diskStorage({
        destination: "./uploads/products",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("")
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error("Only image files are allowed!"), false)
        }
        cb(null, true)
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductManagementModule {}
