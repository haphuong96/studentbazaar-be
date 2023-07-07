// https://stackoverflow.com/questions/55366037/inject-typeorm-repository-into-nestjs-service-for-mock-data-testing
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};
