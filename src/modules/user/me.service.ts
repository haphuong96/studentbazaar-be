import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';


@Injectable()
export class MeService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,

        private readonly em: EntityManager
    ) {}
}