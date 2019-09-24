require('module-alias/register');

module.exports = {
  testPathIgnorePatterns: ['./rollup.test.js'],
  preset: 'jest-puppeteer',
  testEnvironment: 'jest-environment-puppeteer',
};
