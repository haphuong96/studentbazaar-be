import {
  Entity,
  EntityDTO,
  Enum,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  types,
  wrap,
  Collection
} from '@mikro-orm/core';
import { PickUpPoint } from '../../market/entities/pickup-point.entity';
import { UniversityCampus } from '../../market/entities/university-campus.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Item } from '../../item/entities/item.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  universityCampus?: UniversityCampus;

  @ManyToOne()
  defaultPickUpPoint?: PickUpPoint;

  @Property({ length: 255 })
  fullname?: string;

  @Property({ length: 255 })
  username!: string;

  @Property({ length: 255 })
  emailAddress!: string;

  @Property({ columnType: 'varbinary(255)', hidden: true })
  password!: string;

  @Enum(() => UserStatus)
  status!: UserStatus;

  @Property({ type: types.text })
  aboutMe?: string;

  @ManyToMany({ entity: () => Conversation, mappedBy: 'participants'})
  conversations = new Collection<Conversation>(this);

  @ManyToMany({ entity: () => Item, pivotTable: 'user_favorite_item'})
  favoriteItems = new Collection<Item>(this);

  constructor(user: {
    id?: number;
    username: string;
    emailAddress: string;
    universityCampus: UniversityCampus;
    fullname?: string;
    password?: string;
  }) {
    this.id = user.id;
    this.universityCampus = user.universityCampus;
    this.fullname = user.fullname;
    this.username = user.username;
    this.emailAddress = user.emailAddress;
    this.password = user.password;
  }

  toJSON(...args: any[]): { [p: string]: any } {
    const o: EntityDTO<this> = wrap(this, true).toObject(...args); // do not forget to pass rest params here
    if (o['universityCampus']) 
    {
      o['university'] = o['universityCampus']['university'];
      o['campus'] = o['universityCampus']['campusLocation'];
      o['suggestedPickUpPoints'] = o['universityCampus']['pickUpPoints'];
    }

    delete o['universityCampus'];

    return o;
  }
}

export enum UserStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}
