import { Migration } from '@mikro-orm/migrations';

export class Migration20230727210747 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `refresh_token` (`id` int unsigned not null auto_increment primary key, `user_id` int unsigned not null, `refresh_token` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `refresh_token` add index `refresh_token_user_id_index`(`user_id`);');
    this.addSql('alter table `refresh_token` add constraint `refresh_token_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;');

    // Rename authentication table to email verification
    this.addSql('ALTER TABLE `authentication` RENAME `email_verification`;')
  }

  async down(): Promise<void> {
    this.addSql('alter table `email_verification` rename `authentication`;');
    this.addSql('drop table if exists `refresh_token`;');
  }

}
