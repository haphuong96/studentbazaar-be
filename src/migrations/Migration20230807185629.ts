import { Migration } from '@mikro-orm/migrations';

export class Migration20230807185629 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_university_campus_id_foreign`;');

    this.addSql('alter table `user` modify `university_campus_id` int unsigned null;');
    this.addSql('alter table `user` add constraint `user_university_campus_id_foreign` foreign key (`university_campus_id`) references `university_campus` (`id`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_university_campus_id_foreign`;');

    this.addSql('alter table `user` modify `university_campus_id` int unsigned not null;');
    this.addSql('alter table `user` add constraint `user_university_campus_id_foreign` foreign key (`university_campus_id`) references `university_campus` (`id`) on update cascade;');
  }

}
