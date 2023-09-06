import { Migration } from '@mikro-orm/migrations';

export class Migration20230906165044 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `conversation` drop `is_read`;');

    this.addSql('alter table `conversation_participant` add `last_read_message_id` int unsigned not null;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `message` (`id`) on update cascade;');
    this.addSql('alter table `conversation_participant` add index `conversation_participant_last_read_message_id_index`(`last_read_message_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_last_read_message_id_foreign`;');

    this.addSql('alter table `conversation` add `is_read` tinyint(1) not null default false;');

    this.addSql('alter table `conversation_participant` drop index `conversation_participant_last_read_message_id_index`;');
    this.addSql('alter table `conversation_participant` drop `last_read_message_id`;');
  }

}
