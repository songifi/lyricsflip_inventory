import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateAuditLogTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ];