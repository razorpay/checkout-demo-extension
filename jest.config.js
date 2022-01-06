const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  globalSetup: './blackbox/setup',
  globalTeardown: './blackbox/teardown',
  testEnvironment: './blackbox/jest-environment',
  testTimeout: 500 * 1000,
  maxWorkers: 10,
  // testRunner: 'jest-circus/runner',
  verbose: true,
  setupFilesAfterEnv: ['./blackbox/jestSetupFileAfterENV'],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'app/modules'],
};
