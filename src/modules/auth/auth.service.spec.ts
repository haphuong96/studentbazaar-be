import { EntityRepository } from '@mikro-orm/mysql';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { University } from '../market/entities/university.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

const oneUni = new University(1, "Queen's University Belfast", 'qub.ac.uk');
const validEmail = 'pnguyen09@qub.ac.uk';
const invalidUniEmail = 'pnguyen09@gmail.com';
const invalidExistedEmail = 'phuong96@qub.ac.uk';

const invalidUniEmailMsg =
  'This email address is either not a valid student email address or this university email address has not yet been registered into our system. Please try again.';
const invalidExistedEmailMsg =
  'This email address has already been registered. Please try again with another email address.';

const uniArray: University[] = [
  oneUni,
  new University(2, 'Ulster University', 'ulster.ac.uk'),
];

const userArray: User[] = [new User(1, 'GreenBubbleTea', 'phuong96@qub.ac.uk')];

const retrieveEmailDomain = (emailAddress: string) =>
  emailAddress.split('@')[1];

/**
 * Testing reference: https://github.com/jmcdo29/testing-nestjs/blob/main/apps/typeorm-sample/src/cat/cat.service.spec.ts
 */
describe('AuthService', () => {
  let authService: AuthService;
  let userRepoMock: EntityRepository<User>;
  let uniRepoMock: EntityRepository<University>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // https://mikro-orm.io/docs/usage-with-nestjs#testing
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockImplementation((args) => {
              const result = userArray.find(
                (user) => user.emailAddress === args.emailAddress,
              );
              return result;
            }),
          },
        },
        {
          provide: getRepositoryToken(University),
          useFactory: jest.fn(() => ({
            findOne: jest.fn()
          }))
        //   useValue: {
        //     findOne: jest.fn().mockImplementation((args) => {
        //       const result = uniArray.find(
        //         (uni) => uni.emailAddressDomain === args.emailAddressDomain,
        //       );
        //       return result;
        //     }),
        //   },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepoMock = moduleRef.get<EntityRepository<User>>(getRepositoryToken(User));
    uniRepoMock = moduleRef.get<EntityRepository<University>>(
      getRepositoryToken(University),
    );
  });

  describe('checkEmailAddress', () => {
    describe('valid', () => {
      it('should return a university based on email domain', async () => {
        const validEmailDomain = retrieveEmailDomain(validEmail);

        const uniRepoSpy = jest.spyOn(uniRepoMock, 'findOne').mockImplementation(() => uniArray[1]);
        uniRepoMock.findOne = jest.fn().mockImplementation(() => uniArray[1]);
        
        expect(authService.checkEmailAddress(validEmail)).resolves.toEqual(
          oneUni,
        );
        expect(uniRepoSpy).toBeCalledWith({
          emailAddressDomain: validEmailDomain,
        });
      });
    });

    // describe('invalid', () => {
    //   it('should throw an error message if this university email domain not registered in system', async () => {
    //     const invalidEmailDomain = retrieveEmailDomain(invalidUniEmail);
    //     const uniRepoSpy = jest.spyOn(uniRepoMock, 'findOne');

    //     // https://jestjs.io/docs/next/tutorial-async#error-handling
    //     expect.assertions(4);
    //     try {
    //       await authService.checkEmailAddress(invalidUniEmail);
    //     } catch (e) {
    //       expect(e).toBeInstanceOf(HttpException);
    //       expect(e.status).toBe(HttpStatus.BAD_REQUEST);
    //       expect(e.response).toBe(invalidUniEmailMsg);
    //     }

    //     expect(uniRepoSpy).toBeCalledWith({
    //       emailAddressDomain: invalidEmailDomain,
    //     });

    //     // expect(() =>
    //     //   authService.checkEmailAddress(invalidUniEmail),
    //     // ).toThrowError(HttpException);
    //     // await expect(
    //     //   authService.checkEmailAddress(invalidUniEmail),
    //     // ).rejects.toEqual({
    //     //   error: 'User with 3 not found.',
    //     // });
    //   });
    // });
  });
});
