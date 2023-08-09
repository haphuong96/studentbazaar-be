import { Migration } from '@mikro-orm/migrations';

export class Migration20230808184054 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `about_me` text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop `about_me`;');
  }

}
