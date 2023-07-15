import { Migration } from '@mikro-orm/migrations';

export class Migration20230714232642 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `item` drop foreign key `item_status_id_foreign`;');

    this.addSql('drop table if exists `item_status`;');

    this.addSql('alter table `item` add `status` enum(\'DRAFT\', \'PUBLISHED\', \'RESERVED\', \'SOLD\', \'HIDDEN\') not null;');
    this.addSql('alter table `item` drop index `item_status_id_index`;');
    this.addSql('alter table `item` drop `status_id`;');
  }

  async down(): Promise<void> {
    this.addSql('create table `item_status` (`id` int unsigned not null auto_increment primary key, `status_code` varchar(255) not null, `status_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `item_status` add unique `item_status_status_code_unique`(`status_code`);');

    this.addSql('alter table `item` add `status_id` int unsigned not null;');
    this.addSql('alter table `item` add constraint `item_status_id_foreign` foreign key (`status_id`) references `item_status` (`id`) on update cascade;');
    this.addSql('alter table `item` drop `status`;');
    this.addSql('alter table `item` add index `item_status_id_index`(`status_id`);');
  }

}
