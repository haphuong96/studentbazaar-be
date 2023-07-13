import { EntityRepository, SqlEntityRepository } from '@mikro-orm/mysql';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { University } from '../market/entities/university.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Loaded } from '@mikro-orm/core';
import { MockType } from '../../utils/test.util';
import { ErrorMessage } from '../../common/messages.common';

const validEmail = 'pnguyen09@qub.ac.uk';
const invalidUniEmail = 'pnguyen09@gmail.com';
const invalidExistedEmail = 'phuong96@qub.ac.uk';

const uniArray: University[] = [
  new University(1, "Queen's University Belfast", 'qub.ac.uk'),
  new University(2, 'Ulster University', 'ulster.ac.uk'),
];

const userArray: User[] = [
  new User({id: 1, username: 'GreenBubbleTea', emailAddress: 'phuong96@qub.ac.uk', university: uniArray[1]}),
];

const retrieveEmailDomain = (emailAddress: string) =>
  emailAddress.split('@')[1];

/**
 * Testing reference: https://github.com/jmcdo29/testing-nestjs/blob/main/apps/typeorm-sample/src/cat/cat.service.spec.ts
 */
describe('AuthService', () => {
  let authService: AuthService;
  let userRepoMock: MockType<EntityRepository<User>>; // DeepMocked<EntityRepository<User>>;
  let uniRepoMock: MockType<EntityRepository<University>>; //DeepMocked<EntityRepository<University>>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // https://mikro-orm.io/docs/usage-with-nestjs#testing
        {
          provide: getRepositoryToken(User),
          useValue: createMock<EntityRepository<User>>(),
        },
        {
          provide: getRepositoryToken(University),
          useValue: createMock<EntityRepository<University>>(),
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepoMock = moduleRef.get(getRepositoryToken(User));
    uniRepoMock = moduleRef.get(getRepositoryToken(University));

  });

  describe('checkEmailAddress', () => {
    describe('valid', () => {
      it('should return a university based on email domain', async () => {
        // Arrange
        const validEmailDomain = retrieveEmailDomain(validEmail);

        // should return a valid university and no existing user email
        const uniRepoResult: University = uniArray[0];
        const userRepoResult: User = undefined;

        const uniRepoSpy = jest.spyOn(uniRepoMock, 'findOne').mockResolvedValue(uniRepoResult);
        const userRepoSpy = jest.spyOn(userRepoMock, 'findOne').mockResolvedValue(userRepoResult);

        // Act & Assert
        expect(authService.checkEmailAddress(validEmail)).resolves.toEqual(
          uniRepoResult,
        );
        expect(uniRepoSpy).toBeCalledWith({
          emailAddressDomain: validEmailDomain,
        });
      });
    });

    describe('invalid', () => {
      it('should throw an error message if this university email address domain not registered in system', async () => {
        // Arrange
        const invalidEmailDomain = retrieveEmailDomain(invalidUniEmail);

        // should return null university
        const uniRepoResult: University = undefined;

        const uniRepoSpy = jest.spyOn(uniRepoMock, 'findOne').mockResolvedValue(uniRepoResult);

        // Act & Assert
        // https://jestjs.io/docs/next/tutorial-async#error-handling
        expect.assertions(4);
        try {
          await authService.checkEmailAddress(invalidUniEmail);
        } catch (e) {
          expect(e).toBeInstanceOf(HttpException);
          expect(e.status).toBe(HttpStatus.BAD_REQUEST);
          expect(e.response).toBe(ErrorMessage.INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN);
        }

        expect(uniRepoSpy).toBeCalledWith({
          emailAddressDomain: invalidEmailDomain,
        });
      });

      it('should throw an error message if this email address has already been registered to system', async () => {
        // Arrange
        // should return a user already registered
        const userRepoResult: User = userArray[0];

        const userRepoSpy = jest.spyOn(userRepoMock, 'findOne').mockResolvedValue(userRepoResult);

        // Act & Assert
        expect.assertions(4);
        try {
          await authService.checkEmailAddress(invalidExistedEmail);
        } catch (e) {
          expect(e).toBeInstanceOf(HttpException);
          expect(e.status).toBe(HttpStatus.BAD_REQUEST);
          expect(e.response).toBe(ErrorMessage.INVALID_EXISTED_EMAIL);
        }

        expect(userRepoSpy).toBeCalledWith({
          emailAddress: invalidExistedEmail,
        });
      })
    });
  });
});
