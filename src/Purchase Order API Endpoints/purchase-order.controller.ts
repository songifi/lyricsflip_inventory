@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly service: PurchaseOrderService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePurchaseOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: number, @Body() dto: ApprovePurchaseOrderDto) {
    return this.service.approve(id, dto.approved);
  }

  @Post(':id/receive')
  receiveGoods(@Param('id') id: number) {
    return this.service.receiveGoods(id);
  }

  @Post('suppliers')
  addSupplier(@Body() data: { name: string; contactEmail: string }) {
    return this.service.addSupplier(data);
  }

  @Get('suppliers')
  getSuppliers() {
    return this.service.getSuppliers();
  }
}
