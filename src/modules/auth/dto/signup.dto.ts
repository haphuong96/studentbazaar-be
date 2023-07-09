export class checkEmailAddressDto {
    email?: string;
}

export class registerUserDto {
    emailAddress: string;
    fullname?: string;
    username: string;
    password: string;
}