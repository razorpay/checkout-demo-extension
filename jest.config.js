const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  globalSetup: './blackbox/setup',
  globalTeardown: './blackbox/teardown',
  testEnvironment: './blackbox/jest-environment',
  testTimeout: 60 * 1000 * (isProd ? 1 : 10),
  maxWorkers: 3,
};
