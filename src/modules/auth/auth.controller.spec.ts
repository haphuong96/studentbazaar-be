import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { University } from '../market/entities/university.entity';

const oneUni = new University(1, "Queen's University Belfast", 'qub.ac.uk');
const reqEmail = 'test@qub.ac.uk';

/**
 * Testing reference: https://github.com/jmcdo29/testing-nestjs/blob/main/apps/typeorm-sample/src/cat/cat.controller.spec.ts
 */
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef : TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // https://docs.nestjs.com/fundamentals/custom-providers
        {
          provide: AuthService,
          useValue: {
            checkEmailAddress: jest
              .fn()
              .mockImplementation((emailAddress: string) =>
                Promise.resolve(oneUni),
              ),
          },
        },
      ],
    })
      // .useMocker((token) => {
      //   if (token === AuthService) {
      //     return {
      //       checkEmailAddress: jest
      //         .fn()
      //         .mockImplementation((emailAddress: string) =>
      //           Promise.resolve(oneUni),
      //         ),
      //     };
      //   }
      // })
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('Signup', () => {
    describe('checkEmailAddress', () => {
      it('should return a university', async () => {
        const checkMailSpy = jest
          .spyOn(authService, 'checkEmailAddress')

        expect(await authController.checkEmailAddress(reqEmail)).toEqual(
          oneUni,
        );

        expect(checkMailSpy).toHaveBeenCalledWith(reqEmail);
      });
    });
  });
});
