import { DataSource } from 'typeorm';
import { Setting, SettingScope, SettingType, SettingCategory } from '../../settings/entities/setting.entity';

export async function seedSettings(dataSource: DataSource): Promise<void> {
  const settingRepository = dataSource.getRepository(Setting);

  const defaultSettings = [
    {
      key: 'app.name',
      value: 'LyricsFlip Inventory',
      type: SettingType.STRING,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.GENERAL,
      description: 'Application name displayed in the interface',
      isReadonly: false,
    },
    {
      key: 'app.version',
      value: '1.0.0',
      type: SettingType.STRING,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.SYSTEM,
      description: 'Current application version',
      isReadonly: true,
    },
    {
      key: 'app.timezone',
      value: 'UTC',
      type: SettingType.STRING,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.GENERAL,
      description: 'Default system timezone',
      validation: {
        required: true,
        options: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
      },
    },
    {
      key: 'app.language',
      value: 'en',
      type: SettingType.STRING,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.GENERAL,
      description: 'Default system language',
      validation: {
        required: true,
        options: ['en', 'es', 'fr', 'de'],
      },
    },

    {
      key: 'security.session_timeout',
      value: '3600',
      type: SettingType.NUMBER,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.SECURITY,
      description: 'Session timeout in seconds',
      validation: {
        required: true,
        min: 300,
        max: 86400,
      },
      defaultValue: '3600',
    },
    {
      key: 'security.password_min_length',
      value: '8',
      type: SettingType.NUMBER,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.SECURITY,
      description: 'Minimum password length requirement',
      validation: {
        required: true,
        min: 6,
        max: 128,
      },
      defaultValue: '8',
    },
    {
      key: 'security.max_login_attempts',
      value: '5',
      type: SettingType.NUMBER,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.SECURITY,
      description: 'Maximum login attempts before account lockout',
      validation: {
        required: true,
        min: 3,
        max: 10,
      },
      defaultValue: '5',
    },
    {
      key: 'security.enable_2fa',
      value: 'false',
      type: SettingType.BOOLEAN,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.SECURITY,
      description: 'Enable two-factor authentication',
      defaultValue: 'false',
    },

    {
      key: 'inventory.low_stock_threshold',
      value: '10',
      type: SettingType.NUMBER,
      scope: SettingScope.COMPANY,
      category: SettingCategory.INVENTORY,
      description: 'Default low stock threshold for items',
      validation: {
        required: true,
        min: 0,
        max: 1000,
      },
      defaultValue: '10',
    },
    {
      key: 'inventory.auto_reorder_enabled',
      value: 'false',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.INVENTORY,
      description: 'Enable automatic reordering when stock is low',
      defaultValue: 'false',
    },
    {
      key: 'inventory.default_unit_of_measure',
      value: 'piece',
      type: SettingType.STRING,
      scope: SettingScope.COMPANY,
      category: SettingCategory.INVENTORY,
      description: 'Default unit of measure for new items',
      validation: {
        required: true,
        options: ['piece', 'kg', 'liter', 'meter', 'box', 'case'],
      },
      defaultValue: 'piece',
    },
    {
      key: 'inventory.enable_batch_tracking',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.INVENTORY,
      description: 'Enable batch/lot number tracking for items',
      defaultValue: 'true',
    },
    {
      key: 'inventory.enable_expiry_tracking',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.INVENTORY,
      description: 'Enable expiry date tracking for items',
      defaultValue: 'true',
    },

    {
      key: 'notifications.email_enabled',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.NOTIFICATIONS,
      description: 'Enable email notifications',
      defaultValue: 'true',
    },
    {
      key: 'notifications.low_stock_alerts',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.NOTIFICATIONS,
      description: 'Send alerts when items are low in stock',
      defaultValue: 'true',
    },
    {
      key: 'notifications.expiry_alerts_days',
      value: '30',
      type: SettingType.NUMBER,
      scope: SettingScope.COMPANY,
      category: SettingCategory.NOTIFICATIONS,
      description: 'Days before expiry to send alerts',
      validation: {
        required: true,
        min: 1,
        max: 365,
      },
      defaultValue: '30',
    },
    {
      key: 'notifications.purchase_order_approval',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.NOTIFICATIONS,
      description: 'Send notifications for purchase order approvals',
      defaultValue: 'true',
    },

    {
      key: 'reports.default_date_range',
      value: '30',
      type: SettingType.NUMBER,
      scope: SettingScope.COMPANY,
      category: SettingCategory.REPORTING,
      description: 'Default date range for reports in days',
      validation: {
        required: true,
        min: 1,
        max: 365,
      },
      defaultValue: '30',
    },
    {
      key: 'reports.auto_export_format',
      value: 'pdf',
      type: SettingType.STRING,
      scope: SettingScope.COMPANY,
      category: SettingCategory.REPORTING,
      description: 'Default export format for reports',
      validation: {
        required: true,
        options: ['pdf', 'excel', 'csv'],
      },
      defaultValue: 'pdf',
    },
    {
      key: 'reports.include_charts',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.REPORTING,
      description: 'Include charts in generated reports',
      defaultValue: 'true',
    },

    {
      key: 'appearance.theme',
      value: 'light',
      type: SettingType.STRING,
      scope: SettingScope.COMPANY,
      category: SettingCategory.APPEARANCE,
      description: 'Default application theme',
      validation: {
        required: true,
        options: ['light', 'dark', 'auto'],
      },
      defaultValue: 'light',
    },
    {
      key: 'appearance.items_per_page',
      value: '25',
      type: SettingType.NUMBER,
      scope: SettingScope.COMPANY,
      category: SettingCategory.APPEARANCE,
      description: 'Default number of items to display per page',
      validation: {
        required: true,
        min: 10,
        max: 100,
      },
      defaultValue: '25',
    },
    {
      key: 'appearance.show_item_images',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.COMPANY,
      category: SettingCategory.APPEARANCE,
      description: 'Show item images in lists and tables',
      defaultValue: 'true',
    },

    {
      key: 'integrations.api_rate_limit',
      value: '1000',
      type: SettingType.NUMBER,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.INTEGRATIONS,
      description: 'API rate limit per hour',
      validation: {
        required: true,
        min: 100,
        max: 10000,
      },
      defaultValue: '1000',
    },
    {
      key: 'integrations.webhook_timeout',
      value: '30',
      type: SettingType.NUMBER,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.INTEGRATIONS,
      description: 'Webhook timeout in seconds',
      validation: {
        required: true,
        min: 5,
        max: 300,
      },
      defaultValue: '30',
    },
    {
      key: 'integrations.enable_webhooks',
      value: 'true',
      type: SettingType.BOOLEAN,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.INTEGRATIONS,
      description: 'Enable webhook functionality',
      defaultValue: 'true',
    },
  ];

  for (const settingData of defaultSettings) {
    const existingSetting = await settingRepository.findOne({
      where: {
        key: settingData.key,
        scope: settingData.scope,
        companyId: undefined, 
      },
    });

    if (!existingSetting) {
      const setting = settingRepository.create(settingData);
      await settingRepository.save(setting);
    }
  }

  console.log(` Seeded ${defaultSettings.length} default settings`);
}


