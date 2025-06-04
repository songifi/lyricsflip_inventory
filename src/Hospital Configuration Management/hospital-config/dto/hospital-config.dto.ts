import { IsString, IsArray, IsObject, IsBoolean, IsNumber, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AlertType {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
  EMERGENCY = 'emergency'
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export class LocationDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  floor: string;

  @IsString()
  building: string;

  @IsNumber()
  capacity: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class DepartmentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  head: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations: LocationDto[];

  @IsString()
  contactNumber: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class EquipmentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  locationId: string;

  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;

  @IsString()
  @IsOptional()
  maintenanceSchedule?: string;

  @IsString()
  @IsOptional()
  lastMaintenance?: string;
}

export class PolicyDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  content: string;

  @IsString()
  version: string;

  @IsString()
  effectiveDate: string;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsArray()
  @IsOptional()
  applicableDepartments?: string[];
}

export class NotificationSettingDto {
  @IsEnum(AlertType)
  type: AlertType;

  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsString()
  method: string; // email, sms, push, etc.

  @IsBoolean()
  enabled: boolean;
}

export class AlertConfigDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  condition: string;

  @IsEnum(AlertType)
  severity: AlertType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationSettingDto)
  notifications: NotificationSettingDto[];

  @IsBoolean()
  active: boolean;
}

export class InsuranceProviderDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  contactInfo: string;

  @IsObject()
  billingConfig: any;

  @IsArray()
  @IsString({ each: true })
  supportedServices: string[];

  @IsBoolean()
  active: boolean;
}

export class EmergencyProtocolDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // fire, medical, security, etc.

  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsArray()
  @IsString({ each: true })
  responsiblePersonnel: string[];

  @IsString()
  @IsOptional()
  escalationProcedure?: string;

  @IsBoolean()
  active: boolean;
}

export class HospitalConfigDto {
  @IsString()
  hospitalId: string;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentDto)
  departments: DepartmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentDto)
  equipment: EquipmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyDto)
  policies: PolicyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertConfigDto)
  alerts: AlertConfigDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceProviderDto)
  insuranceProviders: InsuranceProviderDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyProtocolDto)
  emergencyProtocols: EmergencyProtocolDto[];
}
