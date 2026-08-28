import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, SupplierStatus } from './entities/supplier.entity';
import { SupplierContact } from './entities/supplier-contact.entity';
import {
  CommunicationChannel,
  CommunicationDirection,
  SupplierCommunicationLog,
} from './entities/supplier-communication-log.entity';
import { SupplierPerformanceReview } from './entities/supplier-performance-review.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-supplier-status.dto';
import { CreateSupplierContactDto } from './dto/create-supplier-contact.dto';
import { UpdateSupplierContactDto } from './dto/update-supplier-contact.dto';
import { CreateSupplierCommunicationDto } from './dto/create-supplier-communication.dto';
import { CreateSupplierReviewDto } from './dto/create-supplier-review.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';
import {
  SUPPLIER_ITEMS_LOOKUP,
  SupplierItemSummary,
  SupplierItemsLookup,
} from './supplier-items.lookup';

export interface PaginatedSuppliers {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Status transitions.
 *
 * `ARCHIVED` has no outgoing edges: purchase orders reference a supplier by id,
 * so reviving an archived account would silently re-attach it to history that
 * was closed out under a different relationship. Create a new supplier instead.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  SupplierStatus,
  SupplierStatus[]
> = {
  [SupplierStatus.PENDING]: [SupplierStatus.ACTIVE, SupplierStatus.ARCHIVED],
  [SupplierStatus.ACTIVE]: [SupplierStatus.SUSPENDED, SupplierStatus.ARCHIVED],
  [SupplierStatus.SUSPENDED]: [SupplierStatus.ACTIVE, SupplierStatus.ARCHIVED],
  [SupplierStatus.ARCHIVED]: [],
};

export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(SupplierContact)
    private readonly contactRepo: Repository<SupplierContact>,
    @InjectRepository(SupplierCommunicationLog)
    private readonly logRepo: Repository<SupplierCommunicationLog>,
    @InjectRepository(SupplierPerformanceReview)
    private readonly reviewRepo: Repository<SupplierPerformanceReview>,
    @Inject(SUPPLIER_ITEMS_LOOKUP)
    private readonly items: SupplierItemsLookup,
  ) {}

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreateSupplierDto, companyId: string): Promise<Supplier> {
    await this.ensureNameUnique(dto.name, companyId);

    const supplier = this.supplierRepo.create({
      ...dto,
      companyId,
      status: dto.status ?? SupplierStatus.PENDING,
      reviewCount: 0,
      rating: null,
    });
    return this.supplierRepo.save(supplier);
  }

  async findAll(
    query: QuerySuppliersDto,
    companyId: string,
  ): Promise<PaginatedSuppliers> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);

    const qb = this.supplierRepo
      .createQueryBuilder('supplier')
      .where('supplier.companyId = :companyId', { companyId });

    if (query.status) {
      qb.andWhere('supplier.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(supplier.name) LIKE :search OR LOWER(supplier.code) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('supplier.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /** A supplier with its contacts and most recent reviews. */
  async findOne(id: string, companyId: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { id, companyId },
      relations: ['contacts', 'reviews'],
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    companyId: string,
  ): Promise<Supplier> {
    const supplier = await this.requireSupplier(id, companyId);

    if (dto.name && dto.name !== supplier.name) {
      await this.ensureNameUnique(dto.name, companyId);
    }

    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  /**
   * Delete a supplier.
   *
   * Refused once a supplier has been ordered from — inventory items point at it,
   * and removing it would orphan them. Archive instead.
   */
  async remove(id: string, companyId: string): Promise<void> {
    const supplier = await this.requireSupplier(id, companyId);

    const linkedItems = await this.countItems(supplier, companyId);
    if (linkedItems > 0) {
      throw new BadRequestException(
        `Supplier has ${linkedItems} linked inventory item(s); archive it instead of deleting`,
      );
    }

    await this.supplierRepo.remove(supplier);
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  async updateStatus(
    id: string,
    dto: UpdateSupplierStatusDto,
    companyId: string,
    userId?: string,
  ): Promise<Supplier> {
    const supplier = await this.requireSupplier(id, companyId);

    if (supplier.status === dto.status) return supplier;

    const allowed = ALLOWED_STATUS_TRANSITIONS[supplier.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move a supplier from ${supplier.status} to ${dto.status}` +
          (allowed.length
            ? `; allowed: ${allowed.join(', ')}`
            : '; this status is terminal'),
      );
    }

    const previous = supplier.status;
    supplier.status = dto.status;
    const saved = await this.supplierRepo.save(supplier);

    // Every status change leaves a trace, so a suspension is never unexplained.
    await this.logRepo.save(
      this.logRepo.create({
        supplierId: supplier.id,
        channel: CommunicationChannel.OTHER,
        direction: CommunicationDirection.OUTBOUND,
        subject: `Status changed from ${previous} to ${dto.status}`,
        body: dto.reason ?? null,
        recordedBy: userId ?? null,
        occurredAt: new Date(),
      }),
    );

    return saved;
  }

  // ─── Contacts ──────────────────────────────────────────────────────────────

  async listContacts(
    id: string,
    companyId: string,
  ): Promise<SupplierContact[]> {
    await this.requireSupplier(id, companyId);
    return this.contactRepo.find({
      where: { supplierId: id },
      order: { isPrimary: 'DESC', name: 'ASC' },
    });
  }

  async addContact(
    id: string,
    dto: CreateSupplierContactDto,
    companyId: string,
  ): Promise<SupplierContact> {
    await this.requireSupplier(id, companyId);

    if (dto.isPrimary) await this.demoteExistingPrimary(id);

    const contact = this.contactRepo.create({
      ...dto,
      supplierId: id,
      isPrimary: dto.isPrimary ?? false,
    });
    return this.contactRepo.save(contact);
  }

  async updateContact(
    id: string,
    contactId: string,
    dto: UpdateSupplierContactDto,
    companyId: string,
  ): Promise<SupplierContact> {
    await this.requireSupplier(id, companyId);

    const contact = await this.contactRepo.findOne({
      where: { id: contactId, supplierId: id },
    });
    if (!contact)
      throw new NotFoundException('Contact not found for this supplier');

    if (dto.isPrimary && !contact.isPrimary)
      await this.demoteExistingPrimary(id);

    Object.assign(contact, dto);
    return this.contactRepo.save(contact);
  }

  async removeContact(
    id: string,
    contactId: string,
    companyId: string,
  ): Promise<void> {
    await this.requireSupplier(id, companyId);

    const contact = await this.contactRepo.findOne({
      where: { id: contactId, supplierId: id },
    });
    if (!contact)
      throw new NotFoundException('Contact not found for this supplier');

    await this.contactRepo.remove(contact);
  }

  // ─── Communication log ─────────────────────────────────────────────────────

  async listCommunications(
    id: string,
    companyId: string,
  ): Promise<SupplierCommunicationLog[]> {
    await this.requireSupplier(id, companyId);
    return this.logRepo.find({
      where: { supplierId: id },
      order: { occurredAt: 'DESC' },
    });
  }

  async logCommunication(
    id: string,
    dto: CreateSupplierCommunicationDto,
    companyId: string,
    userId?: string,
  ): Promise<SupplierCommunicationLog> {
    await this.requireSupplier(id, companyId);

    if (dto.contactId) {
      const contact = await this.contactRepo.findOne({
        where: { id: dto.contactId, supplierId: id },
      });
      if (!contact)
        throw new BadRequestException(
          'Contact does not belong to this supplier',
        );
    }

    const entry = this.logRepo.create({
      ...dto,
      supplierId: id,
      contactId: dto.contactId ?? null,
      recordedBy: userId ?? null,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });
    return this.logRepo.save(entry);
  }

  // ─── Performance ───────────────────────────────────────────────────────────

  async listReviews(
    id: string,
    companyId: string,
  ): Promise<SupplierPerformanceReview[]> {
    await this.requireSupplier(id, companyId);
    return this.reviewRepo.find({
      where: { supplierId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async addReview(
    id: string,
    dto: CreateSupplierReviewDto,
    companyId: string,
    userId?: string,
  ): Promise<SupplierPerformanceReview> {
    await this.requireSupplier(id, companyId);

    const review = await this.reviewRepo.save(
      this.reviewRepo.create({
        ...dto,
        supplierId: id,
        purchaseOrderId: dto.purchaseOrderId ?? null,
        reviewedBy: userId ?? null,
      }),
    );

    await this.recalculateRating(id);
    return review;
  }

  /**
   * Recompute the denormalised rating from every review.
   *
   * Recomputed rather than folded incrementally so a deleted or corrected review
   * cannot leave the average permanently wrong.
   */
  async recalculateRating(supplierId: string): Promise<void> {
    const reviews = await this.reviewRepo.find({ where: { supplierId } });

    if (reviews.length === 0) {
      await this.supplierRepo.update(
        { id: supplierId },
        { rating: null, reviewCount: 0 },
      );
      return;
    }

    const total = reviews.reduce((sum, review) => sum + review.overall, 0);
    const average = total / reviews.length;

    await this.supplierRepo.update(
      { id: supplierId },
      { rating: average.toFixed(2), reviewCount: reviews.length },
    );
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  /**
   * Inventory items sourced from this supplier.
   *
   * `InventoryItem.supplier` is a free-text name rather than a foreign key, so
   * the association is matched on the name. The match is exact and
   * case-sensitive on purpose: a fuzzy one would silently attribute another
   * supplier's stock. A follow-up that adds a real `supplierId` column changes
   * only the lookup, not this method or its endpoint.
   */
  async findItems(
    id: string,
    companyId: string,
  ): Promise<SupplierItemSummary[]> {
    const supplier = await this.requireSupplier(id, companyId);
    return this.items.findBySupplier(companyId, supplier.name);
  }

  private async countItems(
    supplier: Supplier,
    companyId: string,
  ): Promise<number> {
    return this.items.countBySupplier(companyId, supplier.name);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async requireSupplier(
    id: string,
    companyId: string,
  ): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { id, companyId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  private async ensureNameUnique(
    name: string,
    companyId: string,
  ): Promise<void> {
    const existing = await this.supplierRepo.findOne({
      where: { name, companyId },
    });
    if (existing)
      throw new BadRequestException('Supplier name must be unique per company');
  }

  private async demoteExistingPrimary(supplierId: string): Promise<void> {
    await this.contactRepo.update(
      { supplierId, isPrimary: true },
      { isPrimary: false },
    );
  }
}
