        
        
        // inventory-movement.entity.ts
        import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

        export enum MovementType {
          STOCK_IN = 'STOCK_IN',
          STOCK_OUT = 'STOCK_OUT',
          TRANSFER = 'TRANSFER',
          ADJUSTMENT = 'ADJUSTMENT'
        }
        
        export enum MovementStatus {
          PENDING = 'PENDING',
          APPROVED = 'APPROVED',
          IN_PROGRESS = 'IN_PROGRESS',
          COMPLETED = 'COMPLETED',
          CANCELLED = 'CANCELLED',
          FAILED = 'FAILED',
          REJECTED = 'REJECTED'
        }
        
        export enum MovementPriority {
          LOW = 'LOW',
          NORMAL = 'NORMAL',
          HIGH = 'HIGH',
          URGENT = 'URGENT'
        }
        
        @Entity('inventory_movements')
        export class InventoryMovement {
          @PrimaryGeneratedColumn('uuid')
          id: string;
        
          @Column({ type: 'varchar', length: 50 })
          productId: string;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          fromLocationId?: string;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          toLocationId?: string;
        
          @Column({ type: 'enum', enum: MovementType })
          type: MovementType;
        
          @Column({ type: 'enum', enum: MovementStatus, default: MovementStatus.PENDING })
          status: MovementStatus;
        
          @Column({ type: 'enum', enum: MovementPriority, default: MovementPriority.NORMAL })
          priority: MovementPriority;
        
          @Column({ type: 'decimal', precision: 10, scale: 2 })
          quantity: number;
        
          @Column({ type: 'varchar', length: 20 })
          unit: string;
        
          @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
          unitCost?: number;
        
          @Column({ type: 'text', nullable: true })
          reason?: string;
        
          @Column({ type: 'varchar', length: 100, nullable: true })
          referenceNumber?: string;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          userId?: string;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          approvedBy?: string;
        
          @Column({ type: 'timestamp', nullable: true })
          approvedAt?: Date;
        
          @Column({ type: 'timestamp', nullable: true })
          scheduledAt?: Date;
        
          @Column({ type: 'timestamp', nullable: true })
          completedAt?: Date;
        
          @Column({ type: 'json', nullable: true })
          metadata?: any;
        
          @Column({ type: 'text', nullable: true })
          notes?: string;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          batchNumber?: string;
        
          @Column({ type: 'date', nullable: true })
          expiryDate?: Date;
        
          @Column({ type: 'varchar', length: 50, nullable: true })
          supplierId?: string;
        
          @Column({ type: 'varchar', length: 100, nullable: true })
          parentMovementId?: string;
        
          @CreateDateColumn()
          createdAt: Date;
        
          @UpdateDateColumn()
          updatedAt: Date;
        }