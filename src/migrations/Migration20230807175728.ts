import { Migration } from '@mikro-orm/migrations';

export class Migration20230807175728 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_university_id_foreign`;');
    this.addSql('alter table `user` drop foreign key `user_campus_id_foreign`;');

    this.addSql('alter table `user` drop index `user_university_id_index`;');
    this.addSql('alter table `user` drop index `user_campus_id_index`;');
    this.addSql('alter table `user` change `university_id` `university_campus_id` int unsigned not null;');
    this.addSql('alter table `user` add `university_campus_id` int unsigned not null;')
    // migrate data
    this.addSql('update `user` set `university_campus_id` = (select `id` from `university_campus` where `university_id` = `user`.`university_id` and `campus_id` = `user`.`campus_id`);');
    this.addSql('alter table `user` drop `campus_id`;');
    this.addSql('alter table `user` drop `university_id`;');
    this.addSql('alter table `user` add constraint `user_university_campus_id_foreign` foreign key (`university_campus_id`) references `university_campus` (`id`) on update cascade;');
    this.addSql('alter table `user` add index `user_university_campus_id_index`(`university_campus_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_university_campus_id_foreign`;');

    this.addSql('alter table `user` add `campus_id` int unsigned null;');
    this.addSql('alter table `user` drop index `user_university_campus_id_index`;');
    this.addSql('alter table `user` add constraint `user_campus_id_foreign` foreign key (`campus_id`) references `campus_location` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `user` change `university_campus_id` `university_id` int unsigned not null;');
    this.addSql('alter table `user` add constraint `user_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade;');
    this.addSql('alter table `user` add index `user_university_id_index`(`university_id`);');
    this.addSql('alter table `user` add index `user_campus_id_index`(`campus_id`);');
  }

}
