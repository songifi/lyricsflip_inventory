import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeysToLocationItems1711234567890
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE location_items 
      ADD CONSTRAINT FK_location_items_location_id 
      FOREIGN KEY (location_id) 
      REFERENCES locations(id) 
      ON DELETE CASCADE 
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE location_items 
      ADD CONSTRAINT FK_location_items_item_id 
      FOREIGN KEY (item_id) 
      REFERENCES inventory_items(id) 
      ON DELETE CASCADE 
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'location_items',
      'FK_location_items_item_id',
    );
    await queryRunner.dropForeignKey(
      'location_items',
      'FK_location_items_location_id',
    );
  }
}
