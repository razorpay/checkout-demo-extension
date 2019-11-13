const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  testEnvironment: './blackbox/jest-environment',
  maxWorkers: isProd ? 4 : 6,
};
