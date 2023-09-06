import { CustomBadRequestException, CustomNotFoundException } from '../common/exceptions/custom.exception';
import { IPrimaryKey } from '@mikro-orm/core';
import { ErrorCode } from '../common/exceptions/constants.exception';

export const findOneOrFailBadRequestExceptionHandler = (
  entityName: string,
  where: Record<string, any> | IPrimaryKey,
) =>
  new CustomBadRequestException(
    `${entityName} not found`,
    ErrorCode.BAD_REQUEST_ENTITY_NOT_FOUND,
  );

export const findOneOrFailNotFoundExceptionHandler = (
  entityName: string,
  where: Record<string, any> | IPrimaryKey,
) =>
  new CustomNotFoundException(
    `${entityName} not found`,
    ErrorCode.NOT_FOUND_ENTITY_NOT_FOUND,
  );
