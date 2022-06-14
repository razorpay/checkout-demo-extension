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
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['json', 'lcov', 'text-summary', 'html-spa'],
  testResultsProcessor: 'jest-sonar-reporter',
  coveragePathIgnorePatterns: [
    'node_modules',
    '.module.ts',
    '.d.ts',
    '/app/modules/utils/modal.ts',
  ],
};
