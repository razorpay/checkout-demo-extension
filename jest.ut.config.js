module.exports = {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'svelte'],
  roots: ['<rootDir>/app/modules'],
  modulePaths: ['<rootDir>/app/modules'],
  moduleDirectories: ['node_modules', 'app/modules'],
  setupFilesAfterEnv: [
    '<rootDir>/app/modules/tests/setupTest.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testEnvironment: 'jsdom',
  timers: 'legacy',
  clearMocks: true, // Automatically clear mock calls and instances before every test.
};
