import { Module } from "@nestjs/common";
import { HealthService } from "./health.service";
import { HealthController } from "./health.controller";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
