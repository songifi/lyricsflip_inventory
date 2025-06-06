import { Injectable, BadRequestException } from "@nestjs/common"
import { OrderStatus } from "../entities/order.entity"

export interface WorkflowTransition {
  from: OrderStatus
  to: OrderStatus
  conditions?: string[]
  actions?: string[]
}

@Injectable()
export class OrderWorkflowService {
  private readonly transitions: WorkflowTransition[] = [
    // Draft transitions
    { from: OrderStatus.DRAFT, to: OrderStatus.PENDING },
    { from: OrderStatus.DRAFT, to: OrderStatus.CANCELLED },

    // Pending transitions
    { from: OrderStatus.PENDING, to: OrderStatus.CONFIRMED, conditions: ["payment_verified", "stock_available"] },
    { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED },

    // Confirmed transitions
    { from: OrderStatus.CONFIRMED, to: OrderStatus.PROCESSING, actions: ["allocate_stock"] },
    { from: OrderStatus.CONFIRMED, to: OrderStatus.CANCELLED, actions: ["release_stock"] },

    // Processing transitions
    { from: OrderStatus.PROCESSING, to: OrderStatus.PICKING, conditions: ["stock_allocated"] },
    { from: OrderStatus.PROCESSING, to: OrderStatus.CANCELLED, actions: ["release_stock"] },

    // Picking transitions
    { from: OrderStatus.PICKING, to: OrderStatus.PACKED, conditions: ["all_items_picked"] },
    { from: OrderStatus.PICKING, to: OrderStatus.PROCESSING }, // Back to processing if issues

    // Packed transitions
    { from: OrderStatus.PACKED, to: OrderStatus.SHIPPED, conditions: ["shipping_label_created"] },
    { from: OrderStatus.PACKED, to: OrderStatus.PICKING }, // Back to picking if issues

    // Shipped transitions
    { from: OrderStatus.SHIPPED, to: OrderStatus.OUT_FOR_DELIVERY },
    { from: OrderStatus.SHIPPED, to: OrderStatus.DELIVERED },

    // Out for delivery transitions
    { from: OrderStatus.OUT_FOR_DELIVERY, to: OrderStatus.DELIVERED },
    { from: OrderStatus.OUT_FOR_DELIVERY, to: OrderStatus.SHIPPED }, // Back to shipped if delivery failed

    // Delivered transitions
    { from: OrderStatus.DELIVERED, to: OrderStatus.RETURNED },

    // Return/Refund transitions
    { from: OrderStatus.RETURNED, to: OrderStatus.REFUNDED },
    { from: OrderStatus.CANCELLED, to: OrderStatus.REFUNDED },
  ]

  getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return this.transitions.filter((transition) => transition.from === currentStatus).map((transition) => transition.to)
  }

  isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.transitions.some((transition) => transition.from === from && transition.to === to)
  }

  getTransition(from: OrderStatus, to: OrderStatus): WorkflowTransition | undefined {
    return this.transitions.find((transition) => transition.from === from && transition.to === to)
  }

  validateTransition(from: OrderStatus, to: OrderStatus): void {
    if (!this.isValidTransition(from, to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`)
    }
  }

  getRequiredConditions(from: OrderStatus, to: OrderStatus): string[] {
    const transition = this.getTransition(from, to)
    return transition?.conditions || []
  }

  getRequiredActions(from: OrderStatus, to: OrderStatus): string[] {
    const transition = this.getTransition(from, to)
    return transition?.actions || []
  }

  isFinalStatus(status: OrderStatus): boolean {
    const finalStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED]
    return finalStatuses.includes(status)
  }

  isActiveStatus(status: OrderStatus): boolean {
    const activeStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.PICKING,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
    ]
    return activeStatuses.includes(status)
  }
}
