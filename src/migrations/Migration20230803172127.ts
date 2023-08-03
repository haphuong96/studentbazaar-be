import { Migration } from '@mikro-orm/migrations';

export class Migration20230803172127 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `item_image` add `thumbnail_id` int unsigned not null;');
    this.addSql('alter table `item_image` add constraint `item_image_thumbnail_id_foreign` foreign key (`thumbnail_id`) references `image` (`id`) on update cascade;');
    // this.addSql('alter table `item_image` add unique `item_image_thumbnail_id_unique`(`thumbnail_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item_image` drop foreign key `item_image_thumbnail_id_foreign`;');

    this.addSql('alter table `item_image` drop index `item_image_thumbnail_id_unique`;');
    this.addSql('alter table `item_image` drop `thumbnail_id`;');
  }

}
