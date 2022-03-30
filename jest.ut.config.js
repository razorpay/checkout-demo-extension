module.exports = {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.js$': 'babel-jest',
    '^.+\\.(ts)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'svelte', 'ts'],
  roots: [
    '<rootDir>/app/modules',
    '<rootDir>/app/js/checkout-frame',
    '<rootDir>/app/js/lib',
  ],
  modulePaths: ['<rootDir>/app/modules'],
  moduleDirectories: ['node_modules', 'app/modules'],
  setupFilesAfterEnv: [
    '<rootDir>/app/modules/tests/setupTest.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testEnvironment: 'jsdom',
  timers: 'legacy',
  clearMocks: true, // Automatically clear mock calls and instances before every test.
  collectCoverageFrom: collectCoverageFrom(),
  coverageReporters: ['html-spa', 'text-summary'],
};

function collectCoverageFrom() {
  if (process.env.__SVELTE_COVERAGE__) {
    return [
      '<rootDir>/app/modules/**/*.*',
      '<rootDir>/app/js/checkout-frame/**/*.*',
      '<rootDir>/app/js/lib/**/*.*',
    ];
  }

  // use the jest's default mechanism for collecting coverage,
  // which ever file gets resolved during test execution,
  // will be considered for coverage
  return undefined;
}
