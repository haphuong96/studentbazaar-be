import { Migration } from '@mikro-orm/migrations';

export class Migration20230817191115 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user_favorite_item` (`user_id` int unsigned not null, `item_id` int unsigned not null, primary key (`user_id`, `item_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user_favorite_item` add index `user_favorite_item_user_id_index`(`user_id`);');
    this.addSql('alter table `user_favorite_item` add index `user_favorite_item_item_id_index`(`item_id`);');

    this.addSql('alter table `user_favorite_item` add constraint `user_favorite_item_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `user_favorite_item` add constraint `user_favorite_item_item_id_foreign` foreign key (`item_id`) references `item` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `user_favorite_item`;');
  }

}
