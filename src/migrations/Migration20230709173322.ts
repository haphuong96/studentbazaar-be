import { Migration } from '@mikro-orm/migrations';

export class Migration20230709173322 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_campus_id_foreign`;');

    this.addSql('alter table `user` modify `campus_id` int unsigned null;');
    this.addSql('alter table `user` add constraint `user_campus_id_foreign` foreign key (`campus_id`) references `campus_location` (`id`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_campus_id_foreign`;');

    this.addSql('alter table `user` modify `campus_id` int unsigned not null;');
    this.addSql('alter table `user` add constraint `user_campus_id_foreign` foreign key (`campus_id`) references `campus_location` (`id`) on update cascade;');
  }

}
