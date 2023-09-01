import { Migration } from '@mikro-orm/migrations';

export class Migration20230831150430 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `item_image` drop foreign key `item_image_image_id_foreign`;');

    this.addSql('alter table `item_image` drop foreign key `item_image_thumbnail_id_foreign`;');

    this.addSql('create table `azure_storage_blob` (`id` int unsigned not null auto_increment primary key, `blob_name` text not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('alter table `item_image` add constraint `item_image_image_id_foreign` foreign key (`image_id`) references `azure_storage_blob` (`id`) on update cascade;');
    this.addSql('alter table `item_image` add constraint `item_image_thumbnail_id_foreign` foreign key (`thumbnail_id`) references `azure_storage_blob` (`id`) on update cascade;');
    
    this.addSql('insert into `azure_storage_blob`(id, blob_name) select id, SUBSTRING(img_path, 52) from `image`;');
    
    this.addSql('drop table if exists `image`;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item_image` drop foreign key `item_image_image_id_foreign`;');

    this.addSql('alter table `item_image` drop foreign key `item_image_thumbnail_id_foreign`;');

    this.addSql('create table `image` (`id` int unsigned not null auto_increment primary key, `img_path` text not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('drop table if exists `azure_storage_blob`;');

    this.addSql('alter table `item_image` add constraint `item_image_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade;');
    this.addSql('alter table `item_image` add constraint `item_image_thumbnail_id_foreign` foreign key (`thumbnail_id`) references `image` (`id`) on update cascade;');
  }

}
