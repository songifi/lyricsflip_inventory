// ARCHIVED: This module has been replaced by inventory-movement.module.ts
// All logic and wiring now exists in inventory-movement.module.ts
//
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { InventoryMovementService } from './inventory-movement.service';
// import { InventoryMovementController } from './inventory-movement.controller';
// import { InventoryMovement } from './entities/inventory-movement.entity';
// import { StockLevel } from './entities/stock-level.entity';
// import { StockAlert } from './entities/stock-alert.entity';
// import { StockReservation } from './entities/stock-reservation.entity';
//
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       InventoryMovement,
//       StockLevel,
//       StockAlert,
//       StockReservation
//     ])
//   ],
//   controllers: [InventoryMovementController],
//   providers: [InventoryMovementService],
//   exports: [InventoryMovementService]
// })
// export class InventoryMovementModule {}
