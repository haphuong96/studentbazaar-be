import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import { errorMessage } from '../../common/messages.common';
import { registerUserDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: EntityRepository<University>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager
  ) {}

  async checkEmailAddress(emailAddress: string): Promise<University> {
    // Check if it is a valid university email address
    const university: University = await this.universityRepository.findOne({
      emailAddressDomain: emailAddress.split('@')[1],
    });
    
    if (!university) {
      throw new HttpException(
        errorMessage.INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if this email address already existed
    const user: User = await this.userRepository.findOne({
      emailAddress: emailAddress,
    });

    if (user) {
      throw new HttpException(
        errorMessage.INVALID_EXISTED_EMAIL,
        HttpStatus.BAD_REQUEST,
      );
    }

    return university;
  }

  async registerUser(registerUserDto: registerUserDto) {
    // Check email address
    const university : University = await this.checkEmailAddress(registerUserDto.emailAddress);

    // Check if username already existed
    const checkUser : User = await this.userRepository.findOne({username: registerUserDto.username});

    if (checkUser) {
      throw new HttpException(
        errorMessage.INVALID_EXISTED_USERNAME,
        HttpStatus.BAD_REQUEST
      )
    }
    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(registerUserDto.password, saltRounds);

    // Create new user
    const newUser : User = new User({
      emailAddress: registerUserDto.emailAddress,
      username: registerUserDto.username,
      fullname: registerUserDto.fullname,
      university: university,
      password: hash
    })

    await this.em.persistAndFlush(newUser);
  }
}
