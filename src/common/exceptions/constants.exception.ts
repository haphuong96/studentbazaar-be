export enum ErrorMessage {
  INVALID_UNIVERSITY_EMAIL_ADDRESS_DOMAIN = 'This email address is either not a valid student email address or this university email address has not yet been registered into our system. Please try again.',
  INVALID_EXISTED_EMAIL = 'This email address has already been registered. Please try again with another email address.',
  INVALID_EXISTED_USERNAME = 'This username already existed. Please try again with another username.',
  INVALID_CREDENTIALS = 'Invalid credentials. Please try again.',
  USER_NOT_FOUND = 'User not found',
  UNAUTHORIZED = 'Unauthorized',
  INVALID_TOKEN = 'Invalid token',
  EMAIL_NOT_VERIFIED = 'Email not verified',
  ERROR_UPLOAD_IMAGE = 'Error uploading image',
  INVALID_USER = 'Invalid user',
  ACCESS_DENIED = 'Access denied',
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNAUTHORIZED_LOGIN = 'UNAUTHORIZED_LOGIN',
  UNAUTHORIZED_REFRESH_TOKEN = 'UNAUTHORIZED_REFRESH_TOKEN',
  FORBIDDEN_EMAIL_NOT_VERIFIED = 'FORBIDDEN_EMAIL_NOT_VERIFIED',
  FORBIDDEN_INVALID_UNIVERSITY_EMAIL = 'FORBIDDEN_INVALID_UNIVERSITY_EMAIL',
  FORBIDDEN_INVALID_USERNAME = 'FORBIDDEN_INVALID_USERNAME',
  FORBIDDEN_INVALID_USER = 'FORBIDDEN_INVALID_USER',
  FORBIDDEN_INVALID_EMAIL_TOKEN = 'FORBIDDEN_INVALID_EMAIL_TOKEN',
  FORBIDDEN_ACCESS_DENIED = 'FORBIDDEN_ACCESS_DENIED',
  BAD_REQUEST_ENTITY_NOT_FOUND = 'BAD_REQUEST_ENTITY_NOT_FOUND',
  NOT_FOUND_ENTITY_NOT_FOUND = 'NOT_FOUND_ENTITY_NOT_FOUND',
  INTERNAL_SERVER_ERROR_UPLOAD_IMAGE = 'INTERNAL_SERVER_ERROR_UPLOAD_IMAGE',
}