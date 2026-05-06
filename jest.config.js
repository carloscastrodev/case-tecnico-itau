// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const defaults = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

module.exports = {
  projects: [
    {
      ...defaults,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
    },
    {
      ...defaults,
      displayName: 'e2e',
      testMatch: ['<rootDir>/src/**/*.e2e.ts'],
      testTimeout: 30000,
    },
  ],
};
