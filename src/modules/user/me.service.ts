import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import { ITokenPayload } from '../auth/auth.interface';


@Injectable()
export class MeService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,

        private readonly em: EntityManager
    ) {}

    async getMyProfile(user: ITokenPayload): Promise<User> {
        return await this.userRepository.findOne(user.sub);
    }
}