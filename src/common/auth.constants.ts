import { SetMetadata } from '@nestjs/common';

// Public routes metadata
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// salt hashes
export const SALT_ROUNDS = 10;

