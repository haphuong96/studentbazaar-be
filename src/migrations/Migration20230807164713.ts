import { Migration } from '@mikro-orm/migrations';

export class Migration20230807164713 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `campus_location` (`id` int unsigned not null auto_increment primary key, `campus_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql(
      'create table `conversation` (`id` int unsigned not null auto_increment primary key) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql(
      'create table `image` (`id` int unsigned not null auto_increment primary key, `img_path` text not null) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql(
      'create table `item_category` (`id` int unsigned not null auto_increment primary key, `category_name` varchar(255) not null, `path` varchar(255) not null, `parent_id` int unsigned null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `item_category` add index `item_category_parent_id_index`(`parent_id`);',
    );
    this.addSql(
      'alter table `item_category` add unique `item_category_path_unique`(`path`);',
    );

    this.addSql(
      'create table `item_condition` (`id` int unsigned not null auto_increment primary key, `condition_name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql(
      'create table `university` (`id` int unsigned not null auto_increment primary key, `university_name` varchar(255) not null, `email_address_domain` varchar(255) not null) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql(
      'create table `university_campus` (`id` int unsigned not null auto_increment primary key, `university_id` int unsigned not null, `campus_location_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `university_campus` add index `university_campus_university_id_index`(`university_id`);',
    );
    this.addSql(
      'alter table `university_campus` add index `university_campus_campus_location_id_index`(`campus_location_id`);',
    );

    this.addSql(
      'create table `pick_up_point` (`id` int unsigned not null auto_increment primary key, `university_campus_location_id` int unsigned not null, `name` varchar(255) not null, `address` varchar(255) not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `pick_up_point` add index `pick_up_point_university_campus_location_id_index`(`university_campus_location_id`);',
    );

    this.addSql(
      "create table `user` (`id` int unsigned not null auto_increment primary key, `university_id` int unsigned not null, `campus_id` int unsigned null, `default_pick_up_point_id` int unsigned null, `fullname` varchar(255) null, `username` varchar(255) not null, `email_address` varchar(255) not null, `password` varbinary(255) not null, `status` enum('UNVERIFIED', 'VERIFIED', 'ACTIVE', 'SUSPENDED') not null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `user` add index `user_university_id_index`(`university_id`);',
    );
    this.addSql(
      'alter table `user` add index `user_campus_id_index`(`campus_id`);',
    );
    this.addSql(
      'alter table `user` add index `user_default_pick_up_point_id_index`(`default_pick_up_point_id`);',
    );

    this.addSql(
      'create table `refresh_token` (`id` int unsigned not null auto_increment primary key, `user_id` int unsigned not null, `refresh_token` varchar(255) not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `refresh_token` add index `refresh_token_user_id_index`(`user_id`);',
    );
    this.addSql(
      'alter table `refresh_token` add unique `refresh_token_user_id_unique`(`user_id`);',
    );

    this.addSql(
      "create table `message` (`id` int unsigned not null auto_increment primary key, `messsage` varchar(255) not null, `conversation_id` int unsigned not null, `sender_id` int unsigned not null, `message_type` enum('message') not null, `created_datetime` datetime not null default current_timestamp()) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `message` add index `message_conversation_id_index`(`conversation_id`);',
    );
    this.addSql(
      'alter table `message` add index `message_sender_id_index`(`sender_id`);',
    );

    this.addSql(
      "create table `item` (`id` int unsigned not null auto_increment primary key, `owner_id` int unsigned not null, `category_id` int unsigned not null, `condition_id` int unsigned not null, `status` enum('DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'HIDDEN') not null, `item_name` varchar(255) not null, `item_description` text null, `item_price` double null, `location_id` int unsigned not null, `created_datetime` datetime not null default current_timestamp(), `last_updated_datetime` datetime not null default current_timestamp()) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `item` add index `item_owner_id_index`(`owner_id`);',
    );
    this.addSql(
      'alter table `item` add index `item_category_id_index`(`category_id`);',
    );
    this.addSql(
      'alter table `item` add index `item_condition_id_index`(`condition_id`);',
    );
    this.addSql(
      'alter table `item` add index `item_location_id_index`(`location_id`);',
    );

    this.addSql(
      'create table `item_image` (`id` int unsigned not null auto_increment primary key, `image_id` int unsigned not null, `thumbnail_id` int unsigned not null, `item_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `item_image` add unique `item_image_image_id_unique`(`image_id`);',
    );
    this.addSql(
      'alter table `item_image` add unique `item_image_thumbnail_id_unique`(`thumbnail_id`);',
    );
    this.addSql(
      'alter table `item_image` add index `item_image_item_id_index`(`item_id`);',
    );

    this.addSql(
      "create table `email_verification` (`id` int unsigned not null auto_increment primary key, `user_id` int unsigned not null, `token` varchar(255) not null, `expired_at` datetime null, `type` enum('EV', 'FPW') not null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `email_verification` add index `email_verification_user_id_index`(`user_id`);',
    );
    this.addSql(
      'alter table `email_verification` add unique `email_verification_user_id_type_unique`(`user_id`, `type`);',
    );

    this.addSql(
      'create table `conversation_participant` (`id` int unsigned not null auto_increment primary key, `conversation_id` int unsigned not null, `participant_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `conversation_participant` add index `conversation_participant_conversation_id_index`(`conversation_id`);',
    );
    this.addSql(
      'alter table `conversation_participant` add index `conversation_participant_participant_id_index`(`participant_id`);',
    );

    this.addSql(
      'alter table `item_category` add constraint `item_category_parent_id_foreign` foreign key (`parent_id`) references `item_category` (`id`) on update cascade on delete set null;',
    );

    this.addSql(
      'alter table `university_campus` add constraint `university_campus_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `university_campus` add constraint `university_campus_campus_location_id_foreign` foreign key (`campus_location_id`) references `campus_location` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `pick_up_point` add constraint `pick_up_point_university_campus_location_id_foreign` foreign key (`university_campus_location_id`) references `university_campus` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `user` add constraint `user_university_id_foreign` foreign key (`university_id`) references `university` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `user` add constraint `user_campus_id_foreign` foreign key (`campus_id`) references `campus_location` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `user` add constraint `user_default_pick_up_point_id_foreign` foreign key (`default_pick_up_point_id`) references `pick_up_point` (`id`) on update cascade on delete set null;',
    );

    this.addSql(
      'alter table `refresh_token` add constraint `refresh_token_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `message` add constraint `message_conversation_id_foreign` foreign key (`conversation_id`) references `conversation` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `message` add constraint `message_sender_id_foreign` foreign key (`sender_id`) references `user` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `item` add constraint `item_owner_id_foreign` foreign key (`owner_id`) references `user` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `item` add constraint `item_category_id_foreign` foreign key (`category_id`) references `item_category` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `item` add constraint `item_condition_id_foreign` foreign key (`condition_id`) references `item_condition` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `item` add constraint `item_location_id_foreign` foreign key (`location_id`) references `pick_up_point` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `item_image` add constraint `item_image_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `item_image` add constraint `item_image_thumbnail_id_foreign` foreign key (`thumbnail_id`) references `image` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `item_image` add constraint `item_image_item_id_foreign` foreign key (`item_id`) references `item` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `email_verification` add constraint `email_verification_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `conversation_participant` add constraint `conversation_participant_conversation_id_foreign` foreign key (`conversation_id`) references `conversation` (`id`) on update cascade;',
    );
    this.addSql(
      'alter table `conversation_participant` add constraint `conversation_participant_participant_id_foreign` foreign key (`participant_id`) references `user` (`id`) on update cascade;',
    );
  }
}
