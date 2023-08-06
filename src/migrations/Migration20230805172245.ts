import { Migration } from '@mikro-orm/migrations';

export class Migration20230805172245 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `university_campus` drop foreign key `university_campus_campus_location_id_foreign`;');
    this.addSql('alter table `university_campus` drop foreign key `university_campus_university_id_foreign`;');

    this.addSql('alter table `university_campus` add `id` int unsigned not null;');
    this.addSql('alter table `university_campus` drop index `university_campus_campus_location_id_index`;');
    this.addSql('alter table `university_campus` drop primary key;');
    this.addSql('alter table `university_campus` change `campus_location_id` `campus_location_id` int unsigned not null;');
    this.addSql('alter table `university_campus` add constraint `university_campus_campus_location_id_foreign` foreign key (`campus_location_id`) references `campus_location` (`id`) on update cascade;');
    this.addSql('alter table `university_campus` add constraint `university_campus_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade;');
    this.addSql('alter table `university_campus` add index `university_campus_campus_location_id_index`(`campus_location_id`);');
    
    // insert increment value for id
    this.addSql('alter table `university_campus` add auto_increment primary key `university_campus_pkey`(`id`);');

    this.addSql('create table `pick_up_point` (`id` int unsigned not null auto_increment primary key, `university_campus_location_id` int unsigned not null, `name` varchar(255) not null, `address` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `pick_up_point` add index `pick_up_point_university_campus_location_id_index`(`university_campus_location_id`);');
    this.addSql('alter table `pick_up_point` add constraint `pick_up_point_university_campus_location_id_foreign` foreign key (`university_campus_location_id`) references `university_campus` (`id`) on update cascade;');

  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `pick_up_point`;');

    this.addSql('alter table `university_campus` drop foreign key `university_campus_campus_id_foreign`;');
    this.addSql('alter table `university_campus` drop foreign key `university_campus_university_id_foreign`;');

    this.addSql('alter table `university_campus` drop index `university_campus_campus_id_index`;');
    this.addSql('alter table `university_campus` drop primary key;');
    this.addSql('alter table `university_campus` drop `id`;');
    this.addSql('alter table `university_campus` change `campus_id` `campus_location_id` int unsigned not null;');
    this.addSql('alter table `university_campus` add constraint `university_campus_campus_location_id_foreign` foreign key (`campus_location_id`) references `campus_location` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `university_campus` add constraint `university_campus_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `university_campus` add index `university_campus_campus_location_id_index`(`campus_location_id`);');
    this.addSql('alter table `university_campus` add primary key `university_campus_pkey`(`university_id`, `campus_location_id`);');
  }

}
