import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import {
  ErrorCode,
  ErrorMessage,
} from '../../common/exceptions/constants.exception';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUtility } from 'src/modules/auth/auth.util';
import { ILogin, ITokenPayload } from './auth.interface';
import { google } from 'googleapis';
import { SALT_ROUNDS } from 'src/common/auth.constants';
import { Authentication, AuthenticationType } from './entities/auth.entity';
import crypto from 'crypto';
import {
  CustomBadRequestException,
  CustomForbiddenException,
  CustomHttpException,
  CustomUnauthorizedException,
} from 'src/common/exceptions/custom.exception';

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

    @InjectRepository(Authentication)
    private readonly authRepository: EntityRepository<Authentication>,

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
      const isMatch: boolean = await bcrypt.compare(
        loginUser.password,
        userFound.password.toString(),
      );

      if (isMatch) {
        // Correct credentials
        // Check if user has been verified
        const auth: Authentication = await this.authRepository.findOne({
          user: userFound,
          type: AuthenticationType.EMAIL_VERIFICATION,
        });

        // if not verified, return user email address and ask user to verify
        if (auth) {
          throw new CustomForbiddenException(
            ErrorMessage.EMAIL_NOT_VERIFIED,
            ErrorCode.FORBIDDEN_EMAIL_NOT_VERIFIED,
            { emailAddress: userFound.emailAddress },
          );
        }

        // Login successfully! Create JWT token
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
    throw new CustomUnauthorizedException(
      ErrorMessage.INVALID_CREDENTIALS,
      ErrorCode.UNAUTHORIZED_LOGIN,
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
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN,
        ErrorCode.FORBIDDEN_INVALID_UNIVERSITY_EMAIL,
      );
    }

    // Check if this email address already existed
    const user: User = await this.userRepository.findOne({
      emailAddress: emailAddress,
    });

    if (user) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_EXISTED_EMAIL,
        ErrorCode.FORBIDDEN_INVALID_UNIVERSITY_EMAIL,
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
    const userFound: User = await this.userRepository.findOne({
      username: newUser.username,
    });

    if (userFound) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_EXISTED_USERNAME,
        ErrorCode.FORBIDDEN_INVALID_USERNAME,
      );
    }
    // Hash password
    const hash: string = await bcrypt.hash(newUser.password, SALT_ROUNDS);

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
    // before sending verification email, always create or update email token first
    const auth: Authentication = await this.createEmailToken(emailAddress);

    await this.sendEmail({
      subject: 'Verify your email',
      to: emailAddress,
      from: process.env.EMAIL,
      html: this.getEmailTemplate(auth.token),
    });
  }

  async sendEmail(emailOptions) {
    let emailTransporter = await this.createTransporter();
    await emailTransporter.sendMail(emailOptions);
  }

  getEmailTemplate(token: string): string {
    return `<br/><b>Hello</b>, <br/><br/> Please verify your email by clicking the link below. The link expires in 1 hour and can only be used once.<br/><br/> 
    <a href="${this.configService.get<string>(
      'email.emailVerificationUrl',
    )}?token=${token}">Verify Email</a><br/><br/>
    If you didn’t request this verification and don’t have a Student Bazaar account then please ignore this email.<br/><br/>
    Team Student Bazaar`;
  }

  async createTransporter() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
    return transporter;
  }

  async createEmailToken(emailAddress: string): Promise<Authentication> {
    // check if email address is valid
    const userFound: User = await this.userRepository.findOne({
      emailAddress: emailAddress,
    });

    if (!userFound) {
      throw new CustomForbiddenException(
        ErrorMessage.USER_NOT_FOUND,
        ErrorCode.FORBIDDEN_INVALID_USER,
      );
    }

    // create email token and store in database
    const emailToken: string = crypto.randomBytes(64).toString('hex');
    // await bcrypt.hash(emailAddress, SALT_ROUNDS);

    const auth: Authentication = await this.em.upsert(Authentication, {
      token: emailToken,
      user: userFound,
      type: AuthenticationType.EMAIL_VERIFICATION,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    });

    this.em.flush();
    return auth;
  }

  async verifyEmail(token: string): Promise<boolean> {
    // find token in database
    const auth: Authentication = await this.authRepository.findOne({
      token: token,
      type: AuthenticationType.EMAIL_VERIFICATION,
    });

    if (!auth) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_TOKEN,
        ErrorCode.FORBIDDEN_INVALID_EMAIL_TOKEN,
      );
    }

    // delete token
    await this.em.removeAndFlush(auth);
    return true;
  }

  async refreshToken(refreshToken: string): Promise<ILogin> {
    let decoded: any;

    // Verify refresh token
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>(
          'jwtConstants.refreshTokenSecret',
        ),
      });
    } catch (err) {
      throw new CustomUnauthorizedException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED_REFRESH_TOKEN,
      );
    }

    const { sub, username, ...rest } = decoded;

    // Create new access token
    const loginCredentials: ILogin = await this.authUtility.generateTokens({
      sub,
      username,
    });

    return loginCredentials;

    // return {
    //   accessToken: await this.jwtService.signAsync(payload, {
    //     expiresIn: this.configService.get<string>('jwtConstants.accessTokenExpire'),
    //     secret: this.configService.get<string>('jwtConstants.accessTokenSecret'),
    //   })
    // }
  }
}
