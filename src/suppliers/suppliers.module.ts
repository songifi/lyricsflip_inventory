import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';
import { SupplierContact } from './entities/supplier-contact.entity';
import { SupplierCommunicationLog } from './entities/supplier-communication-log.entity';
import { SupplierPerformanceReview } from './entities/supplier-performance-review.entity';
import {
  INVENTORY_ITEM_ENTITY,
  SUPPLIER_ITEMS_LOOKUP,
  SupplierItemsLookup,
} from './supplier-items.lookup';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      SupplierContact,
      SupplierCommunicationLog,
      SupplierPerformanceReview,
    ]),
  ],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    {
      // Resolved by entity name so this module does not import the inventory
      // entity class. See supplier-items.lookup.ts.
      provide: SUPPLIER_ITEMS_LOOKUP,
      inject: [DataSource],
      useFactory: (dataSource: DataSource): SupplierItemsLookup => {
        const repo = dataSource.getRepository(INVENTORY_ITEM_ENTITY);
        return {
          findBySupplier: (companyId, supplier) =>
            repo.find({ where: { companyId, supplier } }),
          countBySupplier: (companyId, supplier) =>
            repo.count({ where: { companyId, supplier } }),
        };
      },
    },
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
