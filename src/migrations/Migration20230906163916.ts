import { Migration } from '@mikro-orm/migrations';

export class Migration20230906163916 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `conversation` add `is_read` tinyint(1) not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `conversation` drop `is_read`;');
  }

}
