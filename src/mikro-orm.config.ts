import { Options } from '@mikro-orm/core';

const config: Options = {
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
};

export default config;
