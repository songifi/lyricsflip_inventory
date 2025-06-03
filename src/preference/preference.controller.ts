import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { PreferencesService } from './services/preference.service';

@Controller('user/notification-preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get(':userId')
  async getPreferences(@Param('userId') userId: string) {
    const prefs = await this.preferencesService.getUserPreferences(userId);
    return { userId, preferences: prefs };
  }

  @Put(':userId')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() body: { preferences: Record<string, any> },
  ) {
    await this.preferencesService.updatePreferences(userId, body.preferences);
    return { message: 'Preferences updated successfully' };
  }
}
