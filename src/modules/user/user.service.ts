import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User, UserStatus } from './entities/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';
import { CampusLocation } from '../market/entities/campus.entity';
import { MarketService } from '../market/market.service';

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
    return await this.userRepository.findOneOrFail(id, {
      failHandler: findOneOrFailBadRequestExceptionHandler,
      populate: ['campus', 'university.campuses'],
    });
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const userCreate: User = this.userRepository.create({
      ...user,
      status: UserStatus.UNVERIFIED,
    });

    await this.em.persistAndFlush(userCreate);
    return userCreate;
  }

  async updateUser(user: UpdateUserDto, userId: number): Promise<User> {
    const userUpdate: User = await this.getUserById(userId);

    if (user.campusId) {
      const campus: CampusLocation = await this.marketService.getCampusById(
        user.campusId,
      );
      userUpdate.campus = campus;
    }

    if (user.fullname) {
      userUpdate.fullname = user.fullname;
    }

    await this.em.flush();

    return userUpdate;
  }

  async activateAccount(userId: number): Promise<boolean> {
    const user: User = await this.getUserById(userId);
    user.status = UserStatus.ACTIVE;

    await this.em.flush();

    return true;
  }
}
