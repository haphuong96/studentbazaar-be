import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(errorCode: string, message: string, statusCode: number, data?: any) {
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
    constructor(errorCode: string, message: string, data?: any) {
        super(errorCode, message, HttpStatus.BAD_REQUEST, data);
    }
}

export class CustomUnauthorizedException extends CustomHttpException {
    constructor(errorCode: string, message: string, data?: any) {
        super(errorCode, message, HttpStatus.UNAUTHORIZED, data);
    }
}

export class CustomForbiddenException extends CustomHttpException {
    constructor(errorCode: string, message: string, data?: any) {
        super(errorCode, message, HttpStatus.FORBIDDEN, data);
    }
}