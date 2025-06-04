@Module({
    imports: [TypeOrmModule.forFeature([PurchaseOrder, Supplier])],
    controllers: [PurchaseOrderController],
    providers: [PurchaseOrderService],
  })
  export class PurchaseOrderModule {}
  