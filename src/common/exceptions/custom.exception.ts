import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(message: string, statusCode: number, errorCode?: string, data?: any) {
    super(
      {
        errorCode,
        message,
        data
      },
      statusCode,
    );
  }
}

export class CustomBadRequestException extends CustomHttpException {
    constructor(message: string, errorCode?: string, data?: any) {
        super(message, HttpStatus.BAD_REQUEST, errorCode, data);
    }
}

export class CustomUnauthorizedException extends CustomHttpException {
    constructor(message: string, errorCode?: string, data?: any) {
        super(message, HttpStatus.UNAUTHORIZED, errorCode, data);
    }
}

export class CustomForbiddenException extends CustomHttpException {
    constructor(message: string, errorCode?: string, data?: any) {
        super(message, HttpStatus.FORBIDDEN, errorCode, data);
    }
}

export class CustomNotFoundException extends CustomHttpException {
    constructor(message: string, errorCode?: string, data?: any) {
        super(message, HttpStatus.NOT_FOUND, errorCode, data);
    }
}