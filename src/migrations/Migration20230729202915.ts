import { Migration } from '@mikro-orm/migrations';

export class Migration20230729202915 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `image` (`id` int unsigned not null auto_increment primary key, `img_path` text not null) default character set utf8mb4 engine = InnoDB;');
    // Migration data from item_image table to image table
    this.addSql('insert into `image` (`img_path`) select `img_path` from `item_image`;');
    // alter table item_image
    this.addSql('alter table `item_image` add `image_id` int unsigned not null;');

    // Migrate data for image_id
    this.addSql('update `item_image` set `image_id` = (select `id` from `image` where `img_path` = `item_image`.`img_path`);');

    // alter table
    this.addSql('alter table `item_image` add constraint `item_image_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade;');
    this.addSql('alter table `item_image` drop `img_path`;');
    this.addSql('alter table `item_image` add unique `item_image_image_id_unique`(`image_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item_image` drop foreign key `item_image_image_id_foreign`;');

    this.addSql('drop table if exists `image`;');

    this.addSql('alter table `item_image` add `img_path` text not null;');
    this.addSql('alter table `item_image` drop index `item_image_image_id_unique`;');
    this.addSql('alter table `item_image` drop `image_id`;');
  }

}
