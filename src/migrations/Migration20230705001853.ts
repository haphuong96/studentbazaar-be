import { Migration } from '@mikro-orm/migrations';

export class Migration20230705001853 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `campus_location` (`id` int unsigned not null auto_increment primary key, `campus_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `item_category` (`id` int unsigned not null auto_increment primary key, `category_name` varchar(255) not null, `parent_category_id` int unsigned null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `item_category` add index `item_category_parent_category_id_index`(`parent_category_id`);');

    this.addSql('create table `item_condition` (`id` int unsigned not null auto_increment primary key, `condition_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `item_status` (`id` int unsigned not null auto_increment primary key, `status_code` varchar(255) not null, `status_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `item_status` add unique `item_status_status_code_unique`(`status_code`);');

    this.addSql('create table `university` (`id` int unsigned not null auto_increment primary key, `university_name` varchar(255) not null, `email_address_domain` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `university_campus` (`university_id` int unsigned not null, `campus_location_id` int unsigned not null, primary key (`university_id`, `campus_location_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `university_campus` add index `university_campus_university_id_index`(`university_id`);');
    this.addSql('alter table `university_campus` add index `university_campus_campus_location_id_index`(`campus_location_id`);');

    this.addSql('create table `user` (`id` int unsigned not null auto_increment primary key, `university_id` int unsigned not null, `campus_id` int unsigned not null, `fullname` varchar(255) null, `username` varchar(255) not null, `email_address` varchar(255) not null, `password` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user` add index `user_university_id_index`(`university_id`);');
    this.addSql('alter table `user` add index `user_campus_id_index`(`campus_id`);');

    this.addSql('create table `item` (`id` int unsigned not null auto_increment primary key, `owner_id` int unsigned not null, `category_id` int unsigned not null, `condition_id` int unsigned not null, `status_id` int unsigned not null, `item_name` varchar(255) not null, `item_description` text null, `item_price` double null, `created_datetime` datetime not null default current_timestamp(), `last_updated_datetime` datetime not null default current_timestamp()) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `item` add index `item_owner_id_index`(`owner_id`);');
    this.addSql('alter table `item` add index `item_category_id_index`(`category_id`);');
    this.addSql('alter table `item` add index `item_condition_id_index`(`condition_id`);');
    this.addSql('alter table `item` add index `item_status_id_index`(`status_id`);');

    this.addSql('create table `item_image` (`id` int unsigned not null auto_increment primary key, `img_path` text not null, `item_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `item_image` add index `item_image_item_id_index`(`item_id`);');

    this.addSql('alter table `item_category` add constraint `item_category_parent_category_id_foreign` foreign key (`parent_category_id`) references `item_category` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `university_campus` add constraint `university_campus_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `university_campus` add constraint `university_campus_campus_location_id_foreign` foreign key (`campus_location_id`) references `campus_location` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `user` add constraint `user_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade;');
    this.addSql('alter table `user` add constraint `user_campus_id_foreign` foreign key (`campus_id`) references `campus_location` (`id`) on update cascade;');

    this.addSql('alter table `item` add constraint `item_owner_id_foreign` foreign key (`owner_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `item` add constraint `item_category_id_foreign` foreign key (`category_id`) references `item_category` (`id`) on update cascade;');
    this.addSql('alter table `item` add constraint `item_condition_id_foreign` foreign key (`condition_id`) references `item_condition` (`id`) on update cascade;');
    this.addSql('alter table `item` add constraint `item_status_id_foreign` foreign key (`status_id`) references `item_status` (`id`) on update cascade;');

    this.addSql('alter table `item_image` add constraint `item_image_item_id_foreign` foreign key (`item_id`) references `item` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `university_campus` drop foreign key `university_campus_campus_location_id_foreign`;');

    this.addSql('alter table `user` drop foreign key `user_campus_id_foreign`;');

    this.addSql('alter table `item_category` drop foreign key `item_category_parent_category_id_foreign`;');

    this.addSql('alter table `item` drop foreign key `item_category_id_foreign`;');

    this.addSql('alter table `item` drop foreign key `item_condition_id_foreign`;');

    this.addSql('alter table `item` drop foreign key `item_status_id_foreign`;');

    this.addSql('alter table `university_campus` drop foreign key `university_campus_university_id_foreign`;');

    this.addSql('alter table `user` drop foreign key `user_university_id_foreign`;');

    this.addSql('alter table `item` drop foreign key `item_owner_id_foreign`;');

    this.addSql('alter table `item_image` drop foreign key `item_image_item_id_foreign`;');

    this.addSql('drop table if exists `campus_location`;');

    this.addSql('drop table if exists `item_category`;');

    this.addSql('drop table if exists `item_condition`;');

    this.addSql('drop table if exists `item_status`;');

    this.addSql('drop table if exists `university`;');

    this.addSql('drop table if exists `university_campus`;');

    this.addSql('drop table if exists `user`;');

    this.addSql('drop table if exists `item`;');

    this.addSql('drop table if exists `item_image`;');
  }

}
