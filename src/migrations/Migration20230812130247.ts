import { Migration } from '@mikro-orm/migrations';

export class Migration20230812130247 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `message` change `messsage` `message` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `message` change `message` `messsage` varchar(255) not null;');
  }

}
