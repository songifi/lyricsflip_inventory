import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    ValidationPipe
  } from '@nestjs/common';
  import { HospitalConfigService } from './hospital-config.service';
  import { HospitalConfigDto } from './dto/hospital-config.dto';
  
  @Controller('hospital-config')
  export class HospitalConfigController {
    constructor(private readonly hospitalConfigService: HospitalConfigService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body(ValidationPipe) createConfigDto: HospitalConfigDto) {
      return this.hospitalConfigService.create(createConfigDto);
    }
  
    @Get()
    findAll() {
      return this.hospitalConfigService.findAll();
    }
  
    @Get(':hospitalId')
    findOne(@Param('hospitalId') hospitalId: string) {
      return this.hospitalConfigService.findOne(hospitalId);
    }
  
    @Patch(':hospitalId')
    update(
      @Param('hospitalId') hospitalId: string,
      @Body(ValidationPipe) updateConfigDto: Partial<HospitalConfigDto>
    ) {
      return this.hospitalConfigService.update(hospitalId, updateConfigDto);
    }
  
    @Delete(':hospitalId')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('hospitalId') hospitalId: string) {
      return this.hospitalConfigService.remove(hospitalId);
    }
  
    // Department endpoints
    @Post(':hospitalId/departments')
    addDepartment(
      @Param('hospitalId') hospitalId: string,
      @Body() department: any
    ) {
      return this.hospitalConfigService.addDepartment(hospitalId, department);
    }
  
    @Patch(':hospitalId/departments/:departmentId')
    updateDepartment(
      @Param('hospitalId') hospitalId: string,
      @Param('departmentId') departmentId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updateDepartment(hospitalId, departmentId, updates);
    }
  
    @Delete(':hospitalId/departments/:departmentId')
    removeDepartment(
      @Param('hospitalId') hospitalId: string,
      @Param('departmentId') departmentId: string
    ) {
      return this.hospitalConfigService.removeDepartment(hospitalId, departmentId);
    }
  
    // Equipment endpoints
    @Post(':hospitalId/equipment')
    addEquipment(
      @Param('hospitalId') hospitalId: string,
      @Body() equipment: any
    ) {
      return this.hospitalConfigService.addEquipment(hospitalId, equipment);
    }
  
    @Patch(':hospitalId/equipment/:equipmentId')
    updateEquipment(
      @Param('hospitalId') hospitalId: string,
      @Param('equipmentId') equipmentId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updateEquipment(hospitalId, equipmentId, updates);
    }
  
    // Policy endpoints
    @Post(':hospitalId/policies')
    addPolicy(
      @Param('hospitalId') hospitalId: string,
      @Body() policy: any
    ) {
      return this.hospitalConfigService.addPolicy(hospitalId, policy);
    }
  
    @Patch(':hospitalId/policies/:policyId')
    updatePolicy(
      @Param('hospitalId') hospitalId: string,
      @Param('policyId') policyId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updatePolicy(hospitalId, policyId, updates);
    }
  
    // Alert endpoints
    @Post(':hospitalId/alerts')
    addAlert(
      @Param('hospitalId') hospitalId: string,
      @Body() alert: any
    ) {
      return this.hospitalConfigService.addAlert(hospitalId, alert);
    }
  
    @Patch(':hospitalId/alerts/:alertId')
    updateAlert(
      @Param('hospitalId') hospitalId: string,
      @Param('alertId') alertId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updateAlert(hospitalId, alertId, updates);
    }
  
    // Insurance provider endpoints
    @Post(':hospitalId/insurance-providers')
    addInsuranceProvider(
      @Param('hospitalId') hospitalId: string,
      @Body() provider: any
    ) {
      return this.hospitalConfigService.addInsuranceProvider(hospitalId, provider);
    }
  
    @Patch(':hospitalId/insurance-providers/:providerId')
    updateInsuranceProvider(
      @Param('hospitalId') hospitalId: string,
      @Param('providerId') providerId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updateInsuranceProvider(hospitalId, providerId, updates);
    }
  
    @Get(':hospitalId/insurance-providers/active')
    getActiveInsuranceProviders(@Param('hospitalId') hospitalId: string) {
      return this.hospitalConfigService.getActiveInsuranceProviders(hospitalId);
    }
  
    // Emergency protocol endpoints
    @Post(':hospitalId/emergency-protocols')
    addEmergencyProtocol(
      @Param('hospitalId') hospitalId: string,
      @Body() protocol: any
    ) {
      return this.hospitalConfigService.addEmergencyProtocol(hospitalId, protocol);
    }
  
    @Patch(':hospitalId/emergency-protocols/:protocolId')
    updateEmergencyProtocol(
      @Param('hospitalId') hospitalId: string,
      @Param('protocolId') protocolId: string,
      @Body() updates: any
    ) {
      return this.hospitalConfigService.updateEmergencyProtocol(hospitalId, protocolId, updates);
    }
  
    @Get(':hospitalId/emergency-protocols/active')
    getActiveEmergencyProtocols(@Param('hospitalId') hospitalId: string) {
      return this.hospitalConfigService.getActiveEmergencyProtocols(hospitalId);
    }
  
    // Validation endpoints
    @Get(':hospitalId/validate/departments')
    validateDepartmentStructure(@Param('hospitalId') hospitalId: string) {
      return this.hospitalConfigService.validateDepartmentStructure(hospitalId);
    }
  }
  