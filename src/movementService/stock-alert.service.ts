import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAlert, AlertType, AlertStatus } from './entities/stock-alert.entity';
import { StockLevel } from './entities/stock-level.entity';
import { EmailService } from './email.service';

@Injectable()
export class StockAlertService {
  constructor(
    @InjectRepository(StockAlert)
    private readonly alertRepository: Repository<StockAlert>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Checks the stock level and generates alerts if thresholds are crossed.
   * Prevents duplicate active alerts for the same type/product/location.
   */
  async checkAndCreateAlerts(stockLevel: StockLevel): Promise<void> {
    const alertsToCreate: Partial<StockAlert>[] = [];

    // Low stock
    if (
      stockLevel.quantity <= stockLevel.reorderPoint &&
      stockLevel.quantity > 0 &&
      !(await this.hasActiveAlert(stockLevel, AlertType.LOW_STOCK))
    ) {
      alertsToCreate.push({
        type: AlertType.LOW_STOCK,
        status: AlertStatus.ACTIVE,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
        message: `Low stock: ${stockLevel.quantity} units remaining (reorder at: ${stockLevel.reorderPoint})`,
        currentQuantity: stockLevel.quantity,
        thresholdQuantity: stockLevel.reorderPoint,
      });
    }

    // Out of stock
    if (
      stockLevel.quantity <= 0 &&
      !(await this.hasActiveAlert(stockLevel, AlertType.OUT_OF_STOCK))
    ) {
      alertsToCreate.push({
        type: AlertType.OUT_OF_STOCK,
        status: AlertStatus.ACTIVE,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
        message: `Out of stock: Product is completely out of stock`,
        currentQuantity: stockLevel.quantity,
        thresholdQuantity: 0,
      });
    }

    // Overstock
    if (
      stockLevel.maxStockLevel > 0 &&
      stockLevel.quantity > stockLevel.maxStockLevel &&
      !(await this.hasActiveAlert(stockLevel, AlertType.OVERSTOCK))
    ) {
      alertsToCreate.push({
        type: AlertType.OVERSTOCK,
        status: AlertStatus.ACTIVE,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
        message: `Overstock: ${stockLevel.quantity} units exceed max (${stockLevel.maxStockLevel})`,
        currentQuantity: stockLevel.quantity,
        thresholdQuantity: stockLevel.maxStockLevel,
      });
    }

    // Save new alerts
    for (const alert of alertsToCreate) {
      const savedAlert = await this.alertRepository.save(alert);
      // Send email notification
      const recipient = process.env.ALERT_EMAIL_RECIPIENT;
      if (typeof recipient === 'string') {
        const subject = `[Inventory Alert] ${alert.type} for Product ${alert.productId}`;
        const text = alert.message;
        await this.emailService.sendMail(recipient, subject, text);
      }
    }
  }

  /**
   * Checks if there is already an active alert for this product/location/type.
   */
  async hasActiveAlert(stockLevel: StockLevel, type: AlertType): Promise<boolean> {
    const count = await this.alertRepository.count({
      where: {
        type,
        status: AlertStatus.ACTIVE,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
      },
    });
    return count > 0;
  }

  /**
   * List all active alerts, optionally filtered.
   */
  async listAlerts(status: AlertStatus = AlertStatus.ACTIVE): Promise<StockAlert[]> {
    return this.alertRepository.find({ where: { status }, order: { createdAt: 'DESC' } });
  }

  /**
   * Acknowledge or resolve an alert.
   */
  async updateAlertStatus(id: string, status: AlertStatus, acknowledgedBy?: string): Promise<StockAlert> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) throw new Error('Alert not found');
    alert.status = status;
    if (status === AlertStatus.ACKNOWLEDGED && acknowledgedBy) {
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
    return this.alertRepository.save(alert);
  }
}
