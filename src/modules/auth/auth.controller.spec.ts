import { Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service";
import { University } from "../market/entities/university.entity";

const createUniversity = ()
describe('Auth', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authController = moduleRef.get<AuthController>(AuthController);
        authService = moduleRef.get<AuthService>(AuthService);
    })

    describe('Signup', () => {
        describe('checkEmailAddress', () => {
            describe.each([
                ['abc@qub.ac.uk', ]
            ])('valid', () => {
                it('should return a university corresponding to email address', async () => {
                    const emailToCheck = 
                })
            })
        })
    })

})