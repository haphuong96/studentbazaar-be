import { Migration } from '@mikro-orm/migrations';

export class Migration20230713142805 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `authentication` drop foreign key `authentication_type_id_foreign`;');

    this.addSql('drop table if exists `authentication_type`;');

    this.addSql('alter table `authentication` add `type` enum(\'EV\', \'FPW\') not null;');
    this.addSql('alter table `authentication` drop index `authentication_type_id_index`;');
    this.addSql('alter table `authentication` drop `type_id`;');
    this.addSql('alter table `authentication` add unique `authentication_user_id_type_unique`(`user_id`, `type`);');
  }

  async down(): Promise<void> {
    this.addSql('create table `authentication_type` (`id` int unsigned not null auto_increment primary key, `auth_type_code` varchar(255) not null, `auth_type_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `authentication_type` add unique `authentication_type_auth_type_code_unique`(`auth_type_code`);');

    this.addSql('alter table `authentication` add `type_id` int unsigned not null;');
    this.addSql('alter table `authentication` drop index `authentication_user_id_type_unique`;');
    this.addSql('alter table `authentication` add constraint `authentication_type_id_foreign` foreign key (`type_id`) references `authentication_type` (`id`) on update cascade;');
    this.addSql('alter table `authentication` drop `type`;');
    this.addSql('alter table `authentication` add index `authentication_type_id_index`(`type_id`);');
  }

}
