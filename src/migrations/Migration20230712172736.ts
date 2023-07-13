import { Migration } from '@mikro-orm/migrations';

export class Migration20230712172736 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `authentication_type` (`id` int unsigned not null auto_increment primary key, `auth_type_code` varchar(255) not null, `auth_type_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `authentication_type` add unique `authentication_type_auth_type_code_unique`(`auth_type_code`);');

    this.addSql('create table `authentication` (`id` int unsigned not null auto_increment primary key, `user_id` int unsigned not null, `token` varchar(255) not null, `expired_at` datetime null, `type_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `authentication` add index `authentication_user_id_index`(`user_id`);');
    this.addSql('alter table `authentication` add index `authentication_type_id_index`(`type_id`);');

    this.addSql('alter table `authentication` add constraint `authentication_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `authentication` add constraint `authentication_type_id_foreign` foreign key (`type_id`) references `authentication_type` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `authentication` drop foreign key `authentication_type_id_foreign`;');

    this.addSql('drop table if exists `authentication_type`;');

    this.addSql('drop table if exists `authentication`;');
  }

}
