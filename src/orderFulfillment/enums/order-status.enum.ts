// orderFulfillment/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = "pending",
  VALIDATED = "validated",
  ALLOCATED = "allocated",
  PICKING = "picking",
  PICKED = "picked",
  READY_TO_SHIP = "ready_to_ship",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
