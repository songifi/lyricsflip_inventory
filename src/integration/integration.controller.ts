import { Controller, Post, Body, Get, Param, Delete, Headers } from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // Webhook endpoint
  @Post('webhook/:source')
  handleWebhook(@Param('source') source: string, @Body() payload: any, @Headers() headers: any) {
    return this.integrationService.handleWebhook(source, payload, headers);
  }

  // API key management
  @Post('apikey')
  createApiKey(@Body('name') name: string) {
    return this.integrationService.createApiKey(name);
  }

  @Get('apikeys')
  listApiKeys() {
    return this.integrationService.listApiKeys();
  }

  @Delete('apikey/:id')
  revokeApiKey(@Param('id') id: string) {
    return this.integrationService.revokeApiKey(id);
  }

  // Data synchronization
  @Post('sync/push')
  pushData(@Body() data: any) {
    return this.integrationService.pushData(data);
  }

  @Get('sync/pull')
  pullData() {
    return this.integrationService.pullData();
  }

  // Integration health monitoring
  @Get('health')
  healthCheck() {
    return this.integrationService.healthCheck();
  }
}
