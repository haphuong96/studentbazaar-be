import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User, UserStatus } from './entities/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { findOneOrFailBadRequestExceptionHandler } from '../../utils/exception-handler.util';
import { CampusLocation } from '../market/entities/campus.entity';
import { MarketService } from '../market/market.service';
import { University } from '../market/entities/university.entity';
import { CustomNotFoundException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/constants.exception';
import { UniversityCampus } from '../market/entities/university-campus.entity';
import { Item } from '../item/entities/item.entity';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,

    private readonly marketService: MarketService,
  ) {}

  async getUserByEmailOrUsername(emailOrUsername: string): Promise<User> {
    return await this.userRepository.findOne({
      $or: [
        {
          emailAddress: emailOrUsername,
        },
        {
          username: emailOrUsername,
        },
      ],
    });
  }

  async getUserByEmail(emailAddress: string): Promise<User> {
    return await this.userRepository.findOne({ emailAddress });
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ username });
  }

  async getUserById(id: number): Promise<User> {
    const data = await this.userRepository.findOneOrFail(id, {
      failHandler: findOneOrFailBadRequestExceptionHandler,
      populate: [
        'universityCampus.campusLocation',
        'universityCampus.university.campuses',
        'defaultPickUpPoint',
        'universityCampus.pickUpPoints',
      ],
    });
    return data;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    console.log(user);
    const userCreate: User = this.userRepository.create({
      ...user,
      status: UserStatus.UNVERIFIED,
    });

    await this.em.persistAndFlush(userCreate);
    return userCreate;
  }

  async updateUser(user: UpdateUserDto, userId: number): Promise<User> {
    const userUpdate: User = await this.getUserById(userId);

    // update campus
    if (user.campusId) {
      // check user email address to get university
      const university: University =
        await this.marketService.getUniversityByEmailAddress(
          userUpdate.emailAddress,
        );

      if (!university) {
        throw new CustomNotFoundException(
          'University not found',
          ErrorCode.NOT_FOUND_ENTITY_NOT_FOUND,
        );
      }

      // check campus
      const universityCampus: UniversityCampus =
        await this.marketService.getUniversityWithCampus(
          university.id,
          user.campusId,
        );

      userUpdate.universityCampus = universityCampus;
    }

    userUpdate.fullname = user.fullname;
    userUpdate.aboutMe = user.aboutMe;

    await this.em.flush();

    const afterUpdateUser: User = await this.getUserById(userId);

    return afterUpdateUser;
  }

  async activateAccount(userId: number): Promise<boolean> {
    const user: User = await this.getUserById(userId);
    user.status = UserStatus.ACTIVE;

    await this.em.flush();

    return true;
  }

  async getFavoriteItems(userId: number): Promise<Item[]> {
    const user : User = await this.userRepository.findOneOrFail(userId, {
      populate: ['favoriteItems', 'favoriteItems.owner', 'favoriteItems.img.image', 'favoriteItems.img.thumbnail'],
      orderBy: {
        id: 'DESC',
      }
    });

    const items : Item[] = user.favoriteItems.getItems();
    
    const countFavoriteTasks: Promise<void>[] = items.map(async (item) => {
      wrap(item).assign({
        favoriteCount: await item.favoritedBy.loadCount(),
      });
    });

    await Promise.all(countFavoriteTasks);
    
    return items;
  }
}