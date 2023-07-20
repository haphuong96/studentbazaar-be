import { SetMetadata } from '@nestjs/common';

// Guard for public routes
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// salt hashes
export const SALT_ROUNDS = 10;

