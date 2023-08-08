import { RegisterUserDto } from "src/modules/auth/dto/signup.dto";
import { University } from "src/modules/market/entities/university.entity";

export class CreateUserDto extends RegisterUserDto {
    password: string;
}

export class UpdateUserDto {
    campusId?: number;
    fullname?: string;
}