import { Injectable } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User, UserStatus } from '../user/entities/user.entity';
import {
  ErrorCode,
  ErrorMessage,
} from '../../common/exceptions/constants.exception';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JWTTokensUtility } from '../auth/utils/jwt-token.util';
import { ILogin, ITokenPayload } from './auth.interface';
import { google } from 'googleapis';
import { SALT_ROUNDS } from '../../common/auth.constants';
import {
  EmailVerification,
  AuthenticationType,
} from './entities/email-verification.entity';
import crypto from 'crypto';
import {
  CustomForbiddenException,
  CustomUnauthorizedException,
} from '../../common/exceptions/custom.exception';
import { EmailService } from '../email/email.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailTemplate } from '../email/email-template.util';
import { UserService } from '../user/user.service';
import { MarketService } from '../market/market.service';

// TODO:
// - [ ] unit test, .env file...
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerifyRepository: EntityRepository<EmailVerification>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: EntityRepository<RefreshToken>,

    private readonly em: EntityManager,

    private jwtTokensUtility: JWTTokensUtility,

    private userService: UserService,

    private emailService: EmailService,

    private emailTemplate: EmailTemplate,

    private marketService: MarketService,
  ) {}

  /**
   * Verify user credentials. If valid, return a pair of access token and refresh token.
   * @param loginUser
   * @returns
   */
  async verifyUser(loginUser: LoginDto): Promise<ILogin> {
    // find user by email or username
    const userFound: User = await this.userService.getUserByEmailOrUsername(
      loginUser.usernameOrEmail,
    );

    if (userFound) {
      const isMatch: boolean = await bcrypt.compare(
        loginUser.password,
        userFound.password.toString(),
      );

      if (isMatch) {
        // Correct credentials
        // Check if user's email has been verified
        const auth: EmailVerification =
          await this.emailVerifyRepository.findOne({
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

        // Login successfully! Create JWT access token & refresh token
        const payload: ITokenPayload = {
          sub: userFound.id,
          username: userFound.username,
        };

        const accessToken = await this.jwtTokensUtility.signAccessToken(
          payload,
        );
        const refreshToken = await this.jwtTokensUtility.signRefreshToken(
          payload,
        );

        // store refresh token (hashed) in database
        this.em.upsert(RefreshToken, {
          user: userFound,
          refreshToken: await bcrypt.hash(refreshToken, SALT_ROUNDS),
        });

        return {
          accessToken,
          refreshToken,
        };
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
    const university: University =
      await this.marketService.getUniversityByEmailAddress(emailAddress);

    if (!university) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN,
        ErrorCode.FORBIDDEN_INVALID_UNIVERSITY_EMAIL,
      );
    }

    // Check if this email address already existed
    const user: User = await this.userService.getUserByEmail(emailAddress);

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
    await this.checkEmailAddress(newUser.emailAddress);

    // Check if username already existed
    const userFound: User = await this.userService.getUserByUsername(
      newUser.username,
    );

    if (userFound) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_EXISTED_USERNAME,
        ErrorCode.FORBIDDEN_INVALID_USERNAME,
      );
    }

    // Hash password
    const hash: string = await bcrypt.hash(newUser.password, SALT_ROUNDS);

    // Create new user
    return await this.userService.createUser({
      ...newUser,
      password: hash,
    });
  }

  // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
  // https://nodemailer.com/smtp/oauth2/
  // https://oauth.net/2/grant-types/client-credentials/
  async sendVerificationEmail(emailAddress: string) {
    // before sending verification email, always create or update email token first
    const auth: EmailVerification = await this.createEmailToken(emailAddress);

    if (auth) {
      await this.emailService.sendMail({
        subject: 'Verify your email',
        to: 'tnguyen09@qub.ac.uk',
        from: process.env.EMAIL,
        html: this.emailTemplate.getAccountVerificationEmailTemplate(
          auth.token,
          auth.user.username,
        ),
      });
    }
  }

  async createEmailToken(emailAddress: string): Promise<EmailVerification> {
    // check if email address is valid
    const userFound: User = await this.userService.getUserByEmail(emailAddress);

    if (!userFound) {
      return;
    }

    // create email token and store in database
    const emailToken: string = crypto.randomBytes(64).toString('hex');

    const auth: EmailVerification = await this.em.upsert(EmailVerification, {
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
    const auth: EmailVerification = await this.emailVerifyRepository.findOne({
      token: token,
      type: AuthenticationType.EMAIL_VERIFICATION,
    });

    // if token not found or token expired
    if (!auth || auth.expiredAt < new Date()) {
      throw new CustomForbiddenException(
        ErrorMessage.INVALID_TOKEN,
        ErrorCode.FORBIDDEN_INVALID_EMAIL_TOKEN,
      );
    }

    // Email verified successfully
    // update user status
    auth.user.status = UserStatus.VERIFIED;

    // delete token
    await this.em.removeAndFlush(auth);

    return true;
  }

  /**
   * https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
   * When access token is expired, client will send a request to refresh access token.
   *
   * Check the validity of refresh token. The refresh token should be decoded successfully, which means it is a valid JWT token not yet expired.
   * It then should match the refresh token stored in database for the user
   *
   * If refresh token is valid, remove the old refresh token and create a new one (or update).
   * Create an access token and return both access token and the new refresh token to client.
   * @param refreshToken
   * @returns
   */
  async refreshToken(refreshToken: string): Promise<ILogin> {
    // Verify validity of refresh token
    const decodedPayload: ITokenPayload =
      await this.jwtTokensUtility.verifyRefreshToken(refreshToken);

    if (decodedPayload) {
      // Check if refresh token exists in db
      const refreshTokenFound: RefreshToken =
        await this.refreshTokenRepository.findOne({
          user: this.em.getReference(User, decodedPayload.sub),
        });

      // Check if refresh token is the current refresh token of user
      if (refreshTokenFound) {
        const isRefreshTokenMatched : boolean = await bcrypt.compare(
          refreshToken,
          refreshTokenFound.refreshToken,
        );

        if (isRefreshTokenMatched) {
          // Refresh token authenticated successfully. Create new access token and refresh token
          const accessToken: string =
            await this.jwtTokensUtility.signAccessToken(decodedPayload);
          const refreshToken: string =
            await this.jwtTokensUtility.signRefreshToken(decodedPayload);

          // update new refresh token(hashed) for user
          refreshTokenFound.refreshToken = await bcrypt.hash(
            refreshToken,
            SALT_ROUNDS,
          );

          await this.em.flush();
          return { accessToken, refreshToken };
        }

        //TODO: Revoke all refresh tokens of user, if refresh token was used twice
      }
    }

    // throw error otherwise
    throw new CustomUnauthorizedException(
      ErrorMessage.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED_REFRESH_TOKEN,
    );
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    // Find refresh token by user/client
    const user: RefreshToken = await this.refreshTokenRepository.findOne({
      user: this.em.getReference(User, userId),
    });

    if (user) {
      await this.em.removeAndFlush(user);
    }
  }
}
