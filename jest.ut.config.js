module.exports = {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.js$': 'babel-jest',
    '^.+\\.(ts)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'svelte', 'ts'],
  roots: ['<rootDir>/app/modules'],
  modulePaths: ['<rootDir>/app/modules'],
  moduleDirectories: ['node_modules', 'app/modules'],
  setupFilesAfterEnv: [
    '<rootDir>/app/modules/tests/setupTest.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testEnvironment: 'jsdom',
  fakeTimers: {},
  clearMocks: true, // Automatically clear mock calls and instances before every test.
  collectCoverageFrom: ['<rootDir>/app/modules/**/*.*'],
  testMatch: [
    '**/__tests__/*.[jt]s?(x)',
    '**/__test__/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  coverageThreshold: {
    global: {
      statements: 32,
      branches: 15,
      functions: 26,
      lines: 33,
    },
  },
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['html', 'json', 'lcov', 'text-summary'],
  testResultsProcessor: 'jest-sonar-reporter',
  coveragePathIgnorePatterns: [
    'node_modules',
    '.module.ts',
    '.d.ts',
    'app/modules/utils/modal.ts',
    'app/freeze-webworker.js',
    'app/modules/checkoutjs/freeze.ts',
  ],
};
