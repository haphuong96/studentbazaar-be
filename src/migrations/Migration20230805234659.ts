import { Migration } from '@mikro-orm/migrations';

export class Migration20230805234659 extends Migration {

  async up(): Promise<void> {
    // this.addSql('alter table `university_campus` change `campus_id` `campus_location_id` int unsigned not null;');

    this.addSql('alter table `item` add `location_id` int unsigned not null;');
    this.addSql('alter table `item` add constraint `item_location_id_foreign` foreign key (`location_id`) references `pick_up_point` (`id`) on update cascade;');
    this.addSql('alter table `item` add index `item_location_id_index`(`location_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `item` drop foreign key `item_location_id_foreign`;');

    // this.addSql('alter table `university_campus` change `campus_location_id` `campus_id` int unsigned not null;');

    this.addSql('alter table `item` drop index `item_location_id_index`;');
    this.addSql('alter table `item` drop `location_id`;');
  }

}
