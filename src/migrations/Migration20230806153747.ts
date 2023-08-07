import { Migration } from '@mikro-orm/migrations';

export class Migration20230806153747 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `default_pick_up_point_id` int unsigned null;');
    this.addSql('alter table `user` add constraint `user_default_pick_up_point_id_foreign` foreign key (`default_pick_up_point_id`) references `pick_up_point` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `user` add index `user_default_pick_up_point_id_index`(`default_pick_up_point_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop foreign key `user_default_pick_up_point_id_foreign`;');

    this.addSql('alter table `user` drop index `user_default_pick_up_point_id_index`;');
    this.addSql('alter table `user` drop `default_pick_up_point_id`;');
  }

}
