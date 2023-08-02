import { Migration } from '@mikro-orm/migrations';

export class Migration20230731224420 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `conversation` (`id` int unsigned not null auto_increment primary key) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `message` (`id` int unsigned not null auto_increment primary key, `messsage` varchar(255) not null, `conversation_id` int unsigned not null, `sender_id` int unsigned not null, `message_type` enum(\'message\') not null, `created_datetime` datetime not null default current_timestamp()) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `message` add index `message_conversation_id_index`(`conversation_id`);');
    this.addSql('alter table `message` add index `message_sender_id_index`(`sender_id`);');

    this.addSql('create table `conversation_participant` (`id` int unsigned not null auto_increment primary key, `conversation_id` int unsigned not null, `participant_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `conversation_participant` add index `conversation_participant_conversation_id_index`(`conversation_id`);');
    this.addSql('alter table `conversation_participant` add index `conversation_participant_participant_id_index`(`participant_id`);');

    this.addSql('alter table `message` add constraint `message_conversation_id_foreign` foreign key (`conversation_id`) references `conversation` (`id`) on update cascade;');
    this.addSql('alter table `message` add constraint `message_sender_id_foreign` foreign key (`sender_id`) references `user` (`id`) on update cascade;');

    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_conversation_id_foreign` foreign key (`conversation_id`) references `conversation` (`id`) on update cascade;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_participant_id_foreign` foreign key (`participant_id`) references `user` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `message` drop foreign key `message_conversation_id_foreign`;');

    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_conversation_id_foreign`;');

    this.addSql('drop table if exists `conversation`;');

    this.addSql('drop table if exists `message`;');

    this.addSql('drop table if exists `conversation_participant`;');
  }

}
