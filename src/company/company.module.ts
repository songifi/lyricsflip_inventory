import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyIsolationMiddleware } from './company-isolation.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompanyIsolationMiddleware).forRoutes('companies');
  }
}
