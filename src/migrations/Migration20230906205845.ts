import { Migration } from '@mikro-orm/migrations';

export class Migration20230906205845 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `conversation_participant` modify `last_read_message_id` int unsigned not null default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `conversation_participant` modify `last_read_message_id` int unsigned not null;');
  }

}
