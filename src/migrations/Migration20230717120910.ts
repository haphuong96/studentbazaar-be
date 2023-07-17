import { Migration } from '@mikro-orm/migrations';

export class Migration20230717120910 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `item_category` drop foreign key `item_category_parent_category_id_foreign`;');

    this.addSql('alter table `item_category` drop index `item_category_parent_category_id_index`;');
    this.addSql('alter table `item_category` change `parent_category_id` `parent_id` int unsigned null;');
    this.addSql('alter table `item_category` add constraint `item_category_parent_id_foreign` foreign key (`parent_id`) references `item_category` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `item_category` add index `item_category_parent_id_index`(`parent_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item_category` drop foreign key `item_category_parent_id_foreign`;');

    this.addSql('alter table `item_category` drop index `item_category_parent_id_index`;');
    this.addSql('alter table `item_category` change `parent_id` `parent_category_id` int unsigned null;');
    this.addSql('alter table `item_category` add constraint `item_category_parent_category_id_foreign` foreign key (`parent_category_id`) references `item_category` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `item_category` add index `item_category_parent_category_id_index`(`parent_category_id`);');
  }

}
