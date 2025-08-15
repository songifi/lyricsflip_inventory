export interface StockUpdateEvent {
  sku: string;
  locationId: string;
  quantity: number;
  previousQuantity: number;
  change: number;
  timestamp: Date;
}

export interface LowStockAlertEvent {
  sku: string;
  locationId: string;
  currentQuantity: number;
  threshold: number;
  timestamp: Date;
}

export interface InventoryMovementEvent {
  sku: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  timestamp: Date;
}

export interface DashboardUpdateEvent {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  recentMovements: number;
  timestamp: Date;
}