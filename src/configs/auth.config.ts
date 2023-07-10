export const authConfig = () => ({
  jwtConstants: {
    secret: process.env.ACCESS_TOKEN_KEY,
  },
});