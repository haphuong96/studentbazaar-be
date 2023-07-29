import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateUserDto } from './dto/user.dto';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,
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
    });
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const userCreate: User = this.userRepository.create({
      ...user,
    });

    await this.em.persistAndFlush(userCreate);
    return userCreate;
  }
}
