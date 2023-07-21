import { CustomBadRequestException } from 'src/common/exceptions/custom.exception';
import { IPrimaryKey } from '@mikro-orm/core';
import { ErrorCode } from 'src/common/exceptions/constants.exception';

export const findOneOrFailBadRequestExceptionHandler = (
  entityName: string,
  where: Record<string, any> | IPrimaryKey,
) =>
  new CustomBadRequestException(
    `${entityName} not found`,
    ErrorCode.BAD_REQUEST_ENTITY_NOT_FOUND,
  );
