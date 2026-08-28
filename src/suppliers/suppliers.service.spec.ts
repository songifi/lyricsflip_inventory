import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  SuppliersService,
  ALLOWED_STATUS_TRANSITIONS,
} from './suppliers.service';
import { Supplier, SupplierStatus } from './entities/supplier.entity';
import { SupplierContact } from './entities/supplier-contact.entity';
import {
  CommunicationChannel,
  CommunicationDirection,
  SupplierCommunicationLog,
} from './entities/supplier-communication-log.entity';
import { SupplierPerformanceReview } from './entities/supplier-performance-review.entity';
import {
  SUPPLIER_ITEMS_LOOKUP,
  SupplierItemsLookup,
} from './supplier-items.lookup';

const COMPANY = 'company-1';
const SUPPLIER_ID = 'supplier-1';

function mockRepo() {
  return {
    create: jest.fn((input: unknown) => input),
    save: jest.fn((input: object) =>
      Promise.resolve({ id: 'generated-id', ...input }),
    ),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

function supplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    id: SUPPLIER_ID,
    companyId: COMPANY,
    name: 'Acme Supplies',
    status: SupplierStatus.ACTIVE,
    reviewCount: 0,
    rating: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Supplier;
}

describe('SuppliersService', () => {
  let service: SuppliersService;
  let suppliers: ReturnType<typeof mockRepo>;
  let contacts: ReturnType<typeof mockRepo>;
  let logs: ReturnType<typeof mockRepo>;
  let reviews: ReturnType<typeof mockRepo>;
  // Held as standalone functions so assertions reference a plain function
  // rather than an object method (@typescript-eslint/unbound-method).
  let findBySupplier: jest.Mock;
  let countBySupplier: jest.Mock;
  let items: SupplierItemsLookup;

  beforeEach(async () => {
    suppliers = mockRepo();
    contacts = mockRepo();
    logs = mockRepo();
    reviews = mockRepo();
    findBySupplier = jest.fn();
    countBySupplier = jest.fn();
    items = {
      findBySupplier: findBySupplier as SupplierItemsLookup['findBySupplier'],
      countBySupplier:
        countBySupplier as SupplierItemsLookup['countBySupplier'],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: getRepositoryToken(Supplier), useValue: suppliers },
        { provide: getRepositoryToken(SupplierContact), useValue: contacts },
        {
          provide: getRepositoryToken(SupplierCommunicationLog),
          useValue: logs,
        },
        {
          provide: getRepositoryToken(SupplierPerformanceReview),
          useValue: reviews,
        },
        { provide: SUPPLIER_ITEMS_LOOKUP, useValue: items },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('scopes the supplier to the company and starts it pending', async () => {
      suppliers.findOne.mockResolvedValue(null);

      const created = await service.create({ name: 'Acme Supplies' }, COMPANY);

      expect(created).toMatchObject({
        name: 'Acme Supplies',
        companyId: COMPANY,
        status: SupplierStatus.PENDING,
        reviewCount: 0,
        rating: null,
      });
    });

    it('rejects a duplicate name within the same company', async () => {
      suppliers.findOne.mockResolvedValue(supplier());

      await expect(
        service.create({ name: 'Acme Supplies' }, COMPANY),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ─── read ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    function queryBuilder(result: [Supplier[], number]) {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue(result),
      };
      suppliers.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('paginates with sane defaults', async () => {
      const qb = queryBuilder([[supplier()], 1]);

      const page = await service.findAll({}, COMPANY);

      expect(page).toMatchObject({ total: 1, page: 1, limit: 25 });
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(25);
    });

    it('caps the page size', async () => {
      const qb = queryBuilder([[], 0]);

      await service.findAll({ limit: 5_000 }, COMPANY);

      expect(qb.take).toHaveBeenCalledWith(100);
    });

    it('filters by status and lower-cases the search term', async () => {
      const qb = queryBuilder([[], 0]);

      await service.findAll(
        { status: SupplierStatus.ACTIVE, search: 'ACME' },
        COMPANY,
      );

      expect(qb.andWhere).toHaveBeenCalledWith('supplier.status = :status', {
        status: SupplierStatus.ACTIVE,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LIKE :search'),
        {
          search: '%acme%',
        },
      );
    });
  });

  describe('findOne', () => {
    it('raises NotFound for another company’s supplier', async () => {
      suppliers.findOne.mockResolvedValue(null);
      await expect(
        service.findOne(SUPPLIER_ID, 'other-company'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── update / delete ──────────────────────────────────────────────────────

  describe('update', () => {
    it('allows keeping the same name', async () => {
      suppliers.findOne.mockResolvedValueOnce(supplier());

      const updated = await service.update(
        SUPPLIER_ID,
        { name: 'Acme Supplies' },
        COMPANY,
      );

      expect(updated.name).toBe('Acme Supplies');
    });

    it('rejects renaming onto an existing supplier', async () => {
      suppliers.findOne
        .mockResolvedValueOnce(supplier())
        .mockResolvedValueOnce(supplier({ id: 'other', name: 'Globex' }));

      await expect(
        service.update(SUPPLIER_ID, { name: 'Globex' }, COMPANY),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deletes a supplier with no linked items', async () => {
      suppliers.findOne.mockResolvedValue(supplier());
      countBySupplier.mockResolvedValue(0);

      await service.remove(SUPPLIER_ID, COMPANY);

      expect(suppliers.remove).toHaveBeenCalled();
    });

    it('refuses to orphan linked inventory items', async () => {
      suppliers.findOne.mockResolvedValue(supplier());
      countBySupplier.mockResolvedValue(3);

      await expect(service.remove(SUPPLIER_ID, COMPANY)).rejects.toThrow(
        /archive it instead/,
      );
      expect(suppliers.remove).not.toHaveBeenCalled();
    });
  });

  // ─── status ───────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('activates a pending supplier and logs the change', async () => {
      suppliers.findOne.mockResolvedValue(
        supplier({ status: SupplierStatus.PENDING }),
      );

      await service.updateStatus(
        SUPPLIER_ID,
        { status: SupplierStatus.ACTIVE },
        COMPANY,
        'user-1',
      );

      expect(logs.save).toHaveBeenCalled();
      expect(logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Status changed from pending to active',
          channel: CommunicationChannel.OTHER,
          direction: CommunicationDirection.OUTBOUND,
          recordedBy: 'user-1',
        }),
      );
    });

    it('records the stated reason for a suspension', async () => {
      suppliers.findOne.mockResolvedValue(
        supplier({ status: SupplierStatus.ACTIVE }),
      );

      await service.updateStatus(
        SUPPLIER_ID,
        { status: SupplierStatus.SUSPENDED, reason: 'Failed quality audit' },
        COMPANY,
      );

      expect(logs.create).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'Failed quality audit' }),
      );
    });

    it('is a no-op when the status is unchanged', async () => {
      suppliers.findOne.mockResolvedValue(
        supplier({ status: SupplierStatus.ACTIVE }),
      );

      await service.updateStatus(
        SUPPLIER_ID,
        { status: SupplierStatus.ACTIVE },
        COMPANY,
      );

      expect(suppliers.save).not.toHaveBeenCalled();
      expect(logs.save).not.toHaveBeenCalled();
    });

    it('refuses to revive an archived supplier', async () => {
      suppliers.findOne.mockResolvedValue(
        supplier({ status: SupplierStatus.ARCHIVED }),
      );

      await expect(
        service.updateStatus(
          SUPPLIER_ID,
          { status: SupplierStatus.ACTIVE },
          COMPANY,
        ),
      ).rejects.toThrow(/terminal/);
    });

    it('refuses to suspend a supplier that was never activated', async () => {
      suppliers.findOne.mockResolvedValue(
        supplier({ status: SupplierStatus.PENDING }),
      );

      await expect(
        service.updateStatus(
          SUPPLIER_ID,
          { status: SupplierStatus.SUSPENDED },
          COMPANY,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('has an entry for every status in the transition table', () => {
      for (const status of Object.values(SupplierStatus)) {
        expect(ALLOWED_STATUS_TRANSITIONS[status]).toBeDefined();
      }
      expect(ALLOWED_STATUS_TRANSITIONS[SupplierStatus.ARCHIVED]).toEqual([]);
    });
  });

  // ─── contacts ─────────────────────────────────────────────────────────────

  describe('contacts', () => {
    beforeEach(() => suppliers.findOne.mockResolvedValue(supplier()));

    it('demotes the previous primary when a new one is added', async () => {
      await service.addContact(
        SUPPLIER_ID,
        { name: 'Jane', isPrimary: true },
        COMPANY,
      );

      expect(contacts.update).toHaveBeenCalledWith(
        { supplierId: SUPPLIER_ID, isPrimary: true },
        { isPrimary: false },
      );
    });

    it('leaves the primary alone for a non-primary contact', async () => {
      await service.addContact(SUPPLIER_ID, { name: 'Jane' }, COMPANY);

      expect(contacts.update).not.toHaveBeenCalled();
    });

    it('does not demote when the contact is already primary', async () => {
      contacts.findOne.mockResolvedValue({
        id: 'c1',
        supplierId: SUPPLIER_ID,
        isPrimary: true,
      });

      await service.updateContact(
        SUPPLIER_ID,
        'c1',
        { isPrimary: true },
        COMPANY,
      );

      expect(contacts.update).not.toHaveBeenCalled();
    });

    it('raises NotFound for a contact belonging to another supplier', async () => {
      contacts.findOne.mockResolvedValue(null);

      await expect(
        service.updateContact(SUPPLIER_ID, 'c1', { name: 'Jane' }, COMPANY),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── communications ───────────────────────────────────────────────────────

  describe('logCommunication', () => {
    beforeEach(() => suppliers.findOne.mockResolvedValue(supplier()));

    it('defaults occurredAt to now', async () => {
      await service.logCommunication(
        SUPPLIER_ID,
        {
          channel: CommunicationChannel.EMAIL,
          direction: CommunicationDirection.OUTBOUND,
          subject: 'Reorder',
        },
        COMPANY,
      );

      expect(logs.create).toHaveBeenCalledWith(
        expect.objectContaining({ occurredAt: expect.any(Date) as Date }),
      );
    });

    it('accepts a backdated entry', async () => {
      await service.logCommunication(
        SUPPLIER_ID,
        {
          channel: CommunicationChannel.PHONE,
          direction: CommunicationDirection.INBOUND,
          subject: 'Delay notice',
          occurredAt: '2026-01-05T09:00:00.000Z',
        },
        COMPANY,
      );

      const created = logs.create.mock.calls[0][0] as { occurredAt: Date };
      expect(created.occurredAt.toISOString()).toBe('2026-01-05T09:00:00.000Z');
    });

    it('rejects a contact from a different supplier', async () => {
      contacts.findOne.mockResolvedValue(null);

      await expect(
        service.logCommunication(
          SUPPLIER_ID,
          {
            channel: CommunicationChannel.EMAIL,
            direction: CommunicationDirection.OUTBOUND,
            subject: 'Reorder',
            contactId: 'someone-elses-contact',
          },
          COMPANY,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ─── performance ──────────────────────────────────────────────────────────

  describe('reviews', () => {
    beforeEach(() => suppliers.findOne.mockResolvedValue(supplier()));

    it('recalculates the rating from every review after one is added', async () => {
      reviews.find.mockResolvedValue([
        { overall: 5 },
        { overall: 4 },
        { overall: 3 },
      ]);

      await service.addReview(SUPPLIER_ID, { overall: 3 }, COMPANY, 'user-1');

      expect(suppliers.update).toHaveBeenCalledWith(
        { id: SUPPLIER_ID },
        { rating: '4.00', reviewCount: 3 },
      );
    });

    it('rounds the average to two decimal places', async () => {
      reviews.find.mockResolvedValue([
        { overall: 5 },
        { overall: 4 },
        { overall: 4 },
      ]);

      await service.recalculateRating(SUPPLIER_ID);

      expect(suppliers.update).toHaveBeenCalledWith(
        { id: SUPPLIER_ID },
        { rating: '4.33', reviewCount: 3 },
      );
    });

    it('clears the rating when the last review is gone', async () => {
      reviews.find.mockResolvedValue([]);

      await service.recalculateRating(SUPPLIER_ID);

      expect(suppliers.update).toHaveBeenCalledWith(
        { id: SUPPLIER_ID },
        { rating: null, reviewCount: 0 },
      );
    });
  });

  // ─── items ────────────────────────────────────────────────────────────────

  describe('findItems', () => {
    it('matches items on the supplier name within the company', async () => {
      suppliers.findOne.mockResolvedValue(supplier());
      findBySupplier.mockResolvedValue([{ id: 'item-1' }]);

      const found = await service.findItems(SUPPLIER_ID, COMPANY);

      expect(findBySupplier).toHaveBeenCalledWith(COMPANY, 'Acme Supplies');
      expect(found).toHaveLength(1);
    });

    it('raises NotFound before touching the item repository', async () => {
      suppliers.findOne.mockResolvedValue(null);

      await expect(
        service.findItems(SUPPLIER_ID, COMPANY),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findBySupplier).not.toHaveBeenCalled();
    });
  });
});
