import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import { errorMessage } from '../../common/messages.common';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: EntityRepository<University>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,

    private readonly jwtService: JwtService

  ) {}

  async verifyUser(loginUser: LoginDto) : Promise<{accessToken: string}> {
    // find user
    const userFound : User = await this.userRepository.findOne({ 
      $or: [
            {
              emailAddress: loginUser.usernameOrEmail
            },
            {
              username: loginUser.usernameOrEmail
            }
          ]
    });

    if (userFound) {
      console.log('userFound', userFound.password.toString());
      const isMatch = await bcrypt.compare(loginUser.password, userFound.password.toString());

      if (isMatch) {
        // User can log in
        // create JWT token
        const payload = { sub: userFound.id, username: userFound.username};
        return { accessToken : await this.jwtService.signAsync(payload) }
      }
    }
    // 
  }

  /**
   * Check for valid email address to register. An email address is considered valid should conform to following rules:
   * - The email address domain has been registered to system as a university email address
   * - The email address has not yet been registered by another user
   * 
   * @param emailAddress 
   * @returns 
   */
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
    errorMessage.INVALID_EXISTED_EMAIL = "a";
    if (user) {
      throw new HttpException(
        errorMessage.INVALID_EXISTED_EMAIL,
        HttpStatus.BAD_REQUEST,
      );
    }

    return university;
  }

  /**
   * Register a new user.
   * Both email address and username shall be validated. A valid username shall not have been registered by another user yet.
   * 
   * @param newUser 
   */
  async registerUser(newUser: RegisterUserDto) {
    // Check email address
    const university : University = await this.checkEmailAddress(newUser.emailAddress);

    // Check if username already existed
    const checkUser : User = await this.userRepository.findOne({username: newUser.username});

    if (checkUser) {
      throw new HttpException(
        errorMessage.INVALID_EXISTED_USERNAME,
        HttpStatus.BAD_REQUEST
      )
    }
    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(newUser.password, saltRounds);

    // Create new user
    const userCreate : User = new User({
      emailAddress: newUser.emailAddress,
      username: newUser.username,
      fullname: newUser.fullname,
      university: university,
      password: hash
    })

    await this.em.persistAndFlush(userCreate);
  }
}
