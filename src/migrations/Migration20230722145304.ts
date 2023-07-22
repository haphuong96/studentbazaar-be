import { Migration } from '@mikro-orm/migrations';

export class Migration20230722145304 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `item_category` add `path` varchar(255) not null;');
    this.addSql("UPDATE item_category SET path = LOWER(REPLACE(category_name, ' ', '-'));")
    this.addSql('alter table `item_category` add unique `item_category_path_unique`(`path`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item_category` drop index `item_category_path_unique`;');
    this.addSql('alter table `item_category` drop `path`;');
  }

}
