import fs from 'fs';

export const retrieveRefreshToken = () : string => {
  const { refreshToken, ...rest } = JSON.parse(
    fs.readFileSync('./oauth2-token.json', 'utf8'),
  );
  console.log('rt ', refreshToken)
  return refreshToken;
};

export const saveRefreshToken = (refreshToken: string) => {
  fs.writeFileSync(
    './oauth2-token.json',
    JSON.stringify({ refreshToken }),
    'utf8',
  );
};
