import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSettingsTables1700000000000 implements MigrationInterface {
  name = 'CreateSettingsTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['string', 'number', 'boolean', 'json', 'array'],
            default: "'string'",
          },
          {
            name: 'scope',
            type: 'enum',
            enum: ['system', 'company'],
            default: "'system'",
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'general',
              'security',
              'notifications',
              'inventory',
              'reporting',
              'integrations',
              'appearance',
              'system',
            ],
            default: "'general'",
          },
          {
            name: 'companyId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'validation',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isReadonly',
            type: 'boolean',
            default: false,
          },
          {
            name: 'defaultValue',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'setting_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'settingId',
            type: 'uuid',
          },
          {
            name: 'settingKey',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'oldValue',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'newValue',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'changeType',
            type: 'enum',
            enum: ['created', 'updated', 'deleted', 'restored'],
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'changedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['settingId'],
            referencedTableName: 'settings',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['changedBy'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'IDX_SETTINGS_CATEGORY',
        columnNames: ['category'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'IDX_SETTINGS_COMPANY_ID',
        columnNames: ['companyId'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'IDX_SETTINGS_UNIQUE_KEY_SCOPE_COMPANY',
        columnNames: ['key', 'scope', 'companyId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'setting_history',
      new TableIndex({
        name: 'IDX_SETTING_HISTORY_CREATED_AT',
        columnNames: ['createdAt'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('setting_history', 'IDX_SETTING_HISTORY_CREATED_AT');
    await queryRunner.dropIndex('settings', 'IDX_SETTINGS_UNIQUE_KEY_SCOPE_COMPANY');
    await queryRunner.dropIndex('settings', 'IDX_SETTINGS_COMPANY_ID');
    await queryRunner.dropIndex('settings', 'IDX_SETTINGS_CATEGORY');

    await queryRunner.dropTable('setting_history');
    await queryRunner.dropTable('settings');
  }
}