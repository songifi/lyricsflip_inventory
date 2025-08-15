module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/unit/**/*.test.[jt]s', '**/integration/**/*.test.[jt]s'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  coverageDirectory: '<rootDir>/test/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'Test Report',
        outputPath: './test/html_report/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        expand: true,
      },
    ],
  ],

  setupFiles: ['dotenv/config'], // <-- Loads .env.test before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        diagnostics: false,
      },
    ],
  },
  verbose: true, // <-- Gives clearer test output
};
