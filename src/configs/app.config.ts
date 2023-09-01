import { azureURLGenerator } from 'src/utils/azure.util';
import { retrieveRefreshToken } from 'src/utils/oauth2.util';

export default () => ({
  jwtConstants: {
    accessTokenSecret: process.env.ACCESS_TOKEN_KEY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_KEY,
    accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
    refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
  },
  email: {
    emailVerificationUrl: `${process.env.VALID_ORIGIN}/signup/email/verify`,
  },
  azureBlobStorage: {
    urlContainer: azureURLGenerator({
      storageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      containerName: process.env.AZURE_STORAGE_IMAGE_CONTAINER_NAME,
    })
  },
  googleOauth2: {
    clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH2_REDIRECT_URI,
    emailScope: 'https://mail.google.com',
    refreshToken: retrieveRefreshToken() || '',
  },
});
