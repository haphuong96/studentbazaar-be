import { Migration } from '@mikro-orm/migrations';

export class Migration20230709152230 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` modify `password` varbinary(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` modify `password` varchar(255) not null;');
  }

}
