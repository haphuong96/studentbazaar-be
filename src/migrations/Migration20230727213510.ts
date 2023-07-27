import { Migration } from '@mikro-orm/migrations';

export class Migration20230727213510 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `refresh_token` add unique `refresh_token_user_id_unique`(`user_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `refresh_token` drop index `refresh_token_user_id_unique`;');
  }

}
