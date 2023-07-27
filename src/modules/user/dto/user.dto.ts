import { RegisterUserDto } from "src/modules/auth/dto/signup.dto";
import { University } from "src/modules/market/entities/university.entity";

export class CreateUserDto extends RegisterUserDto {
    university: University;
    password: string;
}