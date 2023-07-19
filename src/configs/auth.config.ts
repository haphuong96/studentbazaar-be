export const authConfig = () => ({
  jwtConstants: {
    accessTokenSecret: process.env.ACCESS_TOKEN_KEY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_KEY,
    accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
    refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
  },
  email: {
    emailVerificationUrl: `${process.env.VALID_ORIGIN}/signup/email/verify`,
  }
});