export class checkEmailAddressDto {
    email?: string;
}

export class RegisterUserDto {
    emailAddress: string;
    fullname?: string;
    username: string;
    password: string;
}

export class LoginDto {
    usernameOrEmail: string;
    password: string;
}