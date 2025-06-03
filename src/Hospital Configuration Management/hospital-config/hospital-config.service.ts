import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HospitalConfig } from './entities/hospital-config.entity';
import { HospitalConfigDto } from './dto/hospital-config.dto';

@Injectable()
export class HospitalConfigService {
  constructor(
    @InjectRepository(HospitalConfig)
    private readonly configRepository: Repository<HospitalConfig>,
  ) {}

  async create(createConfigDto: HospitalConfigDto): Promise<HospitalConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { hospitalId: createConfigDto.hospitalId }
    });

    if (existingConfig) {
      throw new BadRequestException('Configuration already exists for this hospital');
    }

    const config = this.configRepository.create(createConfigDto);
    return await this.configRepository.save(config);
  }

  async findAll(): Promise<HospitalConfig[]> {
    return await this.configRepository.find();
  }

  async findOne(hospitalId: string): Promise<HospitalConfig> {
    const config = await this.configRepository.findOne({
      where: { hospitalId }
    });

    if (!config) {
      throw new NotFoundException('Hospital configuration not found');
    }

    return config;
  }

  async update(hospitalId: string, updateConfigDto: Partial<HospitalConfigDto>): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    
    Object.assign(config, updateConfigDto);
    return await this.configRepository.save(config);
  }

  async remove(hospitalId: string): Promise<void> {
    const config = await this.findOne(hospitalId);
    await this.configRepository.remove(config);
  }

  // Department Management
  async addDepartment(hospitalId: string, department: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.departments.push(department);
    return await this.configRepository.save(config);
  }

  async updateDepartment(hospitalId: string, departmentId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const deptIndex = config.departments.findIndex(d => d.id === departmentId);
    
    if (deptIndex === -1) {
      throw new NotFoundException('Department not found');
    }

    config.departments[deptIndex] = { ...config.departments[deptIndex], ...updates };
    return await this.configRepository.save(config);
  }

  async removeDepartment(hospitalId: string, departmentId: string): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.departments = config.departments.filter(d => d.id !== departmentId);
    return await this.configRepository.save(config);
  }

  // Equipment Management
  async addEquipment(hospitalId: string, equipment: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.equipment.push(equipment);
    return await this.configRepository.save(config);
  }

  async updateEquipment(hospitalId: string, equipmentId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const equipIndex = config.equipment.findIndex(e => e.id === equipmentId);
    
    if (equipIndex === -1) {
      throw new NotFoundException('Equipment not found');
    }

    config.equipment[equipIndex] = { ...config.equipment[equipIndex], ...updates };
    return await this.configRepository.save(config);
  }

  // Policy Management
  async addPolicy(hospitalId: string, policy: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.policies.push(policy);
    return await this.configRepository.save(config);
  }

  async updatePolicy(hospitalId: string, policyId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const policyIndex = config.policies.findIndex(p => p.id === policyId);
    
    if (policyIndex === -1) {
      throw new NotFoundException('Policy not found');
    }

    config.policies[policyIndex] = { ...config.policies[policyIndex], ...updates };
    return await this.configRepository.save(config);
  }

  // Alert Configuration
  async addAlert(hospitalId: string, alert: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.alerts.push(alert);
    return await this.configRepository.save(config);
  }

  async updateAlert(hospitalId: string, alertId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const alertIndex = config.alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) {
      throw new NotFoundException('Alert configuration not found');
    }

    config.alerts[alertIndex] = { ...config.alerts[alertIndex], ...updates };
    return await this.configRepository.save(config);
  }

  // Insurance Provider Management
  async addInsuranceProvider(hospitalId: string, provider: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.insuranceProviders.push(provider);
    return await this.configRepository.save(config);
  }

  async updateInsuranceProvider(hospitalId: string, providerId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const providerIndex = config.insuranceProviders.findIndex(p => p.id === providerId);
    
    if (providerIndex === -1) {
      throw new NotFoundException('Insurance provider not found');
    }

    config.insuranceProviders[providerIndex] = { ...config.insuranceProviders[providerIndex], ...updates };
    return await this.configRepository.save(config);
  }

  // Emergency Protocol Management
  async addEmergencyProtocol(hospitalId: string, protocol: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    config.emergencyProtocols.push(protocol);
    return await this.configRepository.save(config);
  }

  async updateEmergencyProtocol(hospitalId: string, protocolId: string, updates: any): Promise<HospitalConfig> {
    const config = await this.findOne(hospitalId);
    const protocolIndex = config.emergencyProtocols.findIndex(p => p.id === protocolId);
    
    if (protocolIndex === -1) {
      throw new NotFoundException('Emergency protocol not found');
    }

    config.emergencyProtocols[protocolIndex] = { ...config.emergencyProtocols[protocolIndex], ...updates };
    return await this.configRepository.save(config);
  }

  // Utility methods for validation and business logic
  async validateDepartmentStructure(hospitalId: string): Promise<boolean> {
    const config = await this.findOne(hospitalId);
    
    // Check if all departments have valid locations
    for (const dept of config.departments) {
      if (!dept.locations || dept.locations.length === 0) {
        return false;
      }
    }
    
    return true;
  }

  async getActiveEmergencyProtocols(hospitalId: string): Promise<any[]> {
    const config = await this.findOne(hospitalId);
    return config.emergencyProtocols.filter(protocol => protocol.active);
  }

  async getActiveInsuranceProviders(hospitalId: string): Promise<any[]> {
    const config = await this.findOne(hospitalId);
    return config.insuranceProviders.filter(provider => provider.active);
  }
}