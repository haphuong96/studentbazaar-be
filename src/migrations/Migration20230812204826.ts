import { Migration } from '@mikro-orm/migrations';

export class Migration20230812204826 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_participant_id_foreign`;');

    this.addSql('alter table `conversation_participant` drop index `conversation_participant_participant_id_index`;');
    this.addSql('alter table `conversation_participant` change `participant_id` `user_id` int unsigned not null;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `conversation_participant` add index `conversation_participant_user_id_index`(`user_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `conversation_participant` drop foreign key `conversation_participant_user_id_foreign`;');

    this.addSql('alter table `conversation_participant` drop index `conversation_participant_user_id_index`;');
    this.addSql('alter table `conversation_participant` change `user_id` `participant_id` int unsigned not null;');
    this.addSql('alter table `conversation_participant` add constraint `conversation_participant_participant_id_foreign` foreign key (`participant_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `conversation_participant` add index `conversation_participant_participant_id_index`(`participant_id`);');
  }

}
