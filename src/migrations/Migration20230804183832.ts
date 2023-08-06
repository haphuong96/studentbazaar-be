import { Migration } from '@mikro-orm/migrations';

export class Migration20230804183832 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `status` enum(\'UNVERIFIED\', \'VERIFIED\', \'ACTIVE\', \'SUSPENDED\') not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop `status`;');
  }

}
