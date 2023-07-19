export const ERROR_FIELD_CODE = {
  USERNAME: 'USERNAME',
};

export const generateFieldError = (
  fieldCode: string,
  errMessage: string,
): { fieldCode: string; errMessage: string } => {
  return {
    fieldCode,
    errMessage,
  };
};