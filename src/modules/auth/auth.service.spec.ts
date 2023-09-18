// import { EntityManager, EntityRepository, SqlEntityRepository } from '@mikro-orm/mysql';
// import { AuthService } from './auth.service';
// import { User } from '../user/entities/user.entity';
// import { University } from '../market/entities/university.entity';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@mikro-orm/nestjs';
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { DeepMocked, createMock } from '@golevelup/ts-jest';
// import { Loaded } from '@mikro-orm/core';
// import { MockType } from '../../utils/test.util';
// import { ErrorMessage } from '../../common/exceptions/constants.exception';
// import { CampusLocation } from '../market/entities/campus.entity';
// import { RefreshToken } from './entities/refresh-token.entity';
// import { JWTTokensUtility } from './utils/jwt-token.util';
// import { UserService } from '../user/user.service';
// import { EmailService } from '../email/email.service';
// import { EmailTemplate } from '../email/email-template.util';
// import { MarketService } from '../market/market.service';
// import { EmailVerification } from './entities/email-verification.entity';

// const emailVerificationUrl = 'http://localhost:5173/signup/email/verify'

// const validEmail = 'pnguyen09@qub.ac.uk';
// const invalidUniEmail = 'pnguyen09@gmail.com';
// const invalidExistedEmail = 'phuong96@qub.ac.uk';

// const uniArray: University[] = [
//   new University(1, "Queen's University Belfast", 'qub.ac.uk'),
//   new University(2, 'Ulster University', 'ulster.ac.uk'),
// ];

// const campusArray: CampusLocation[] = [new CampusLocation(1, 'Belfast')];

// const userArray: User[] = [
//   new User({
//     id: 1,
//     username: 'GreenBubbleTea',
//     emailAddress: 'phuong96@qub.ac.uk',
//     universityCampus: {
//       id: 1,
//       university: uniArray[0],
//       campusLocation: campusArray[0],
//     },
//   }),
// ];

// const retrieveEmailDomain = (emailAddress: string) =>
//   emailAddress.split('@')[1];

// /**
//  * Testing reference: https://github.com/jmcdo29/testing-nestjs/blob/main/apps/typeorm-sample/src/cat/cat.service.spec.ts
//  */
// describe('AuthService', () => {
//   let authService: AuthService;
//   // let userRepoMock: MockType<EntityRepository<User>>; // DeepMocked<EntityRepository<User>>;
//   // let uniRepoMock: MockType<EntityRepository<University>>; //DeepMocked<EntityRepository<University>>;
//   let refreshTokenRepoMock: MockType<EntityRepository<RefreshToken>>; //DeepMocked<EntityRepository<RefreshToken>>;
//   let marketServiceMock: MarketService
//   let userServiceMock: UserService;

//   beforeEach(async () => {
//     const moduleRef: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         // https://mikro-orm.io/docs/usage-with-nestjs#testing
//         {
//           provide: getRepositoryToken(EmailVerification),
//           useValue: createMock<EntityRepository<EmailVerification>>(),
//         },
//         {
//           provide: getRepositoryToken(RefreshToken),
//           useValue: createMock<EntityRepository<RefreshToken>>(),
//         },
//         {
//           provide: EntityManager,
//           useValue: createMock<EntityManager>(),
//         },
//         {
//           provide: JWTTokensUtility,
//           useValue: createMock<JWTTokensUtility>(),
//         },
//         {
//           provide: UserService,
//           useValue: createMock<UserService>(),
//         },
//         {
//           provide: EmailService,
//           useValue: createMock<EmailService>(),
//         },
//         {
//           provide: EmailTemplate,
//           useValue: {
//             getAccountVerificationEmailTemplate: jest.fn().mockImplementation((token: string, username?: string) => {
//               return `<br/><b>Hi${' '+ username}</b>, <br/><br/> Please verify your email by clicking the link below. The link expires in 1 hour and can only be used once.<br/><br/> 
//               <a href="${emailVerificationUrl}?token=${token}">Verify Email</a><br/><br/>
//               If you didn’t request this verification and don’t have a Student Bazaar account then please ignore this email.<br/><br/>
//               Team Student Bazaar`;
//             })
//           }
//         },
//         {
//           provide: MarketService,
//           useValue: createMock<MarketService>(),
//         }
//       ],
//     }).compile();

//     authService = moduleRef.get<AuthService>(AuthService);
//     marketServiceMock = moduleRef.get<MarketService>(MarketService);
//     userServiceMock = moduleRef.get<UserService>(UserService);
//     // userRepoMock = moduleRef.get(getRepositoryToken(User));
//     // uniRepoMock = moduleRef.get(getRepositoryToken(University));
//   });

//   describe('checkEmailAddress', () => {
//     describe('valid', () => {
//       it('should return a university based on email domain', async () => {
//         // Arrange
//         // should return a valid university and no existing user email
//         const result: University = uniArray[0];
//         const userFoundByEmail: User = undefined;

//         const findUniByEmailSpy = jest
//           .spyOn(marketServiceMock, 'getUniversityByEmailAddress')
//           .mockResolvedValue(result);
//         const findUserByEmailSpy = jest
//           .spyOn(userServiceMock, 'getUserByEmail')
//           .mockResolvedValue(userFoundByEmail);

//         // Act & Assert
//         expect(authService.checkEmailAddress(validEmail)).resolves.toEqual(
//           result,
//         );
//         expect(findUniByEmailSpy).toBeCalledWith({
//           validEmail
//         });
//         expect(findUserByEmailSpy).toBeCalledWith({
//           validEmail
//         });
//       });
//     });

//     describe('invalid', () => {
//       it('should throw an error message if this university email address domain not registered in system', async () => {
//         // Arrange
//         const invalidEmailDomain = retrieveEmailDomain(invalidUniEmail);

//         // should return null university
//         const result: University = undefined;

//         const uniRepoSpy = jest
//           .spyOn(marketServiceMock, 'getUniversityByEmailAddress')
//           .mockResolvedValue(result);

//         // Act & Assert
//         // https://jestjs.io/docs/next/tutorial-async#error-handling
//         expect.assertions(4);
//         try {
//           await authService.checkEmailAddress(invalidUniEmail);
//         } catch (e) {
//           expect(e).toBeInstanceOf(HttpException);
//           expect(e.status).toBe(HttpStatus.BAD_REQUEST);
//           expect(e.response).toBe(
//             ErrorMessage.INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN,
//           );
//         }

//         expect(uniRepoSpy).toBeCalledWith({
//           emailAddressDomain: invalidEmailDomain,
//         });
//       });

//       it('should throw an error message if this email address has already been registered to system', async () => {
//         // Arrange
//         // should return a user already registered
//         const userRepoResult: User = userArray[0];

//         const userRepoSpy = jest
//           .spyOn(userRepoMock, 'findOne')
//           .mockResolvedValue(userRepoResult);

//         // Act & Assert
//         expect.assertions(4);
//         try {
//           await authService.checkEmailAddress(invalidExistedEmail);
//         } catch (e) {
//           expect(e).toBeInstanceOf(HttpException);
//           expect(e.status).toBe(HttpStatus.BAD_REQUEST);
//           expect(e.response).toBe(ErrorMessage.INVALID_EXISTED_EMAIL);
//         }

//         expect(userRepoSpy).toBeCalledWith({
//           emailAddress: invalidExistedEmail,
//         });
//       });
//     });
//   });
// });
