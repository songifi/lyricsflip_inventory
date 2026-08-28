/**
 * The suppliers module's view of inventory items.
 *
 * Deliberately narrow. A supplier needs to know which items it sources and how
 * many, and nothing else — depending on the full `InventoryItem` entity would
 * couple this module to the inventory schema for the sake of two columns, and
 * make the supplier tests need the inventory module to load.
 *
 * The TypeORM-backed implementation is wired in `suppliers.module.ts` and
 * resolves the repository by entity name at runtime.
 */
/**
 * An inventory item as the suppliers module sees it: opaque apart from its id.
 *
 * `id` is optional because the lookup resolves the repository by entity name
 * and TypeORM types those rows as `ObjectLiteral`. Callers pass the rows
 * straight through to the response, so nothing here reads a field.
 */
export interface SupplierItemSummary {
  id?: string;
  [key: string]: unknown;
}

export interface SupplierItemsLookup {
  findBySupplier(
    companyId: string,
    supplierName: string,
  ): Promise<SupplierItemSummary[]>;
  countBySupplier(companyId: string, supplierName: string): Promise<number>;
}

/** Injection token for {@link SupplierItemsLookup}. */
export const SUPPLIER_ITEMS_LOOKUP = 'SUPPLIER_ITEMS_LOOKUP';

/** Entity name resolved at runtime; matches `@Entity()` on `InventoryItem`. */
export const INVENTORY_ITEM_ENTITY = 'InventoryItem';
