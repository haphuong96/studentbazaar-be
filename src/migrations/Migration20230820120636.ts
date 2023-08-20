import { Migration } from '@mikro-orm/migrations';

export class Migration20230820120636 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      "alter table `message` modify `message_type` enum('message', 'image') not null;",
    );
  }

  async down(): Promise<void> {
    this.addSql(
      "alter table `message` modify `message_type` enum('message') not null;",
    );
  }
}
