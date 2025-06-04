module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/integration/**/*.test.[jt]s?(x)',
    '**/unit/**/*.test.[jt]s?(x)'
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/index.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      diagnostics: false
    }
  },
};
