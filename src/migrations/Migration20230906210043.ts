import { Migration } from '@mikro-orm/migrations';

export class Migration20230906210043 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_last_read_message_id_foreign`;');

    this.addSql('alter table `conversation_participant` modify `last_read_message_id` int unsigned null;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `message` (`id`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_last_read_message_id_foreign`;');

    this.addSql('alter table `conversation_participant` modify `last_read_message_id` int unsigned not null default 0;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_last_read_message_id_foreign` foreign key (`last_read_message_id`) references `message` (`id`) on update cascade;');
  }

}
