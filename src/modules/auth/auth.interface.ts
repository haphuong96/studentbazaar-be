export interface ITokenPayload {
    sub: number,
    username: string
}

export interface ILogin {
    accessToken: string;
    refreshToken: string;
  }