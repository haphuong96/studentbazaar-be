import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: EntityRepository<University>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async checkEmailAddress(emailAddress: string): Promise<University> {
    // Check if it is a valid university email address
    const university: University = await this.universityRepository.findOne({
      emailAddressDomain: emailAddress.split('@')[1],
    });
    
    if (!university) {
      throw new HttpException(
        'This email address is either not a valid student email address or this university email address has not yet been registered into our system. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if this email address already existed
    const user: User = await this.userRepository.findOne({
      emailAddress: emailAddress,
    });

    if (user) {
      throw new HttpException(
        'This email address has already been registered. Please try again with another email address.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return university;
  }
}
