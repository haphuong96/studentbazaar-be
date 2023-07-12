import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import { errorMessage } from '../../common/messages.common';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUtility } from 'src/modules/auth/auth.util';
import { ITokenPayload } from './auth.interface';
import { google } from 'googleapis';

// TODO: 
// - [ ] Refactor AuthUtility
// - [ ] Refactor send email
// - [ ] unit test, .env file...
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: EntityRepository<University>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,

    private readonly em: EntityManager,

    private configService: ConfigService,

    private readonly jwtService: JwtService,

    private authUtility: AuthUtility,
  ) {}

  /**
   * Verify user credentials. If valid, return a pair of access token and refresh token.
   * @param loginUser
   * @returns
   */
  async verifyUser(
    loginUser: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // find user
    const userFound: User = await this.userRepository.findOne({
      $or: [
        {
          emailAddress: loginUser.usernameOrEmail,
        },
        {
          username: loginUser.usernameOrEmail,
        },
      ],
    });

    if (userFound) {
      const isMatch = await bcrypt.compare(
        loginUser.password,
        userFound.password.toString(),
      );

      if (isMatch) {
        // User can log in
        // create JWT token
        const payload: ITokenPayload = {
          sub: userFound.id,
          username: userFound.username,
        };
        return await this.authUtility.generateTokens(payload);
        // {
        //   accessToken : await this.jwtService.signAsync(payload, {
        //     expiresIn: this.configService.get<string>('jwtConstants.accessTokenExpire'),
        //     secret: this.configService.get<string>('jwtConstants.accessTokenSecret'),
        //   }),

        //   refreshToken: await this.jwtService.signAsync(payload, {
        //     expiresIn: this.configService.get<string>('jwtConstants.refreshTokenExpire'),
        //     secret: this.configService.get<string>('jwtConstants.refreshTokenSecret'),
        //   })
        // }
      }
    }

    // else user rejected
    throw new HttpException(
      errorMessage.INVALID_CREDENTIALS,
      HttpStatus.BAD_REQUEST,
    );
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
    errorMessage.INVALID_EXISTED_EMAIL = 'a';
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
  async registerUser(newUser: RegisterUserDto): Promise<User> {
    // Check email address
    const university: University = await this.checkEmailAddress(
      newUser.emailAddress,
    );

    // Check if username already existed
    const checkUser: User = await this.userRepository.findOne({
      username: newUser.username,
    });

    if (checkUser) {
      throw new HttpException(
        errorMessage.INVALID_EXISTED_USERNAME,
        HttpStatus.BAD_REQUEST,
      );
    }
    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(newUser.password, saltRounds);

    // Create new user
    const userCreate: User = new User({
      emailAddress: newUser.emailAddress,
      username: newUser.username,
      fullname: newUser.fullname,
      university: university,
      password: hash,
    });

    await this.em.persistAndFlush(userCreate);

    return userCreate;
  }

  // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
  // https://nodemailer.com/smtp/oauth2/
  // https://oauth.net/2/grant-types/client-credentials/
  async sendVerificationEmail(emailAddress: string) {
    await this.sendEmail({
      subject: "Test",
      text: "I am sending an email from nodemailer!",
      to: emailAddress,
      from: process.env.EMAIL
    });
    
  }
  
  async sendEmail(emailOptions) {
    let emailTransporter = await this.createTransporter();
    await emailTransporter.sendMail(emailOptions);
  };

  async createTransporter() {
    const Oauth2 = google.auth.OAuth2;
    const oauth2Client = new Oauth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    })

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
    return transporter;

  }
  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload: ITokenPayload = await this.authUtility.verifyToken(
      refreshToken,
      this.configService.get<string>('jwtConstants.refreshTokenSecret'),
    );
    // const payload = await this.jwtService.verifyAsync(tokens.refreshToken, {
    //   secret: this.configService.get<string>('jwtConstants.refreshTokenSecret'),
    // });
    console.log('payload', payload);
    // Create new access token
    return await this.authUtility.generateTokens(payload);
    // return {
    //   accessToken: await this.jwtService.signAsync(payload, {
    //     expiresIn: this.configService.get<string>('jwtConstants.accessTokenExpire'),
    //     secret: this.configService.get<string>('jwtConstants.accessTokenSecret'),
    //   })
    // }
  }
}
