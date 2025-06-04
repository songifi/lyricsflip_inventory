@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async create(dto: CreatePurchaseOrderDto) {
    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const order = this.poRepo.create({ ...dto, status: 'PENDING', supplier });
    return this.poRepo.save(order);
  }

  findAll() {
    return this.poRepo.find({ relations: ['supplier'] });
  }

  findOne(id: number) {
    return this.poRepo.findOne({ where: { id }, relations: ['supplier'] });
  }

  async update(id: number, dto: UpdatePurchaseOrderDto) {
    await this.poRepo.update(id, dto);
    return this.poRepo.findOneBy({ id });
  }

  async remove(id: number) {
    await this.poRepo.delete(id);
    return { deleted: true };
  }

  async approve(id: number, approved: boolean) {
    const status = approved ? 'APPROVED' : 'REJECTED';
    await this.poRepo.update(id, { status });
    return this.poRepo.findOneBy({ id });
  }

  async receiveGoods(id: number) {
    await this.poRepo.update(id, { status: 'RECEIVED' });
    return this.poRepo.findOneBy({ id });
  }

  addSupplier(data: { name: string; contactEmail: string }) {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  getSuppliers() {
    return this.supplierRepo.find();
  }
}
