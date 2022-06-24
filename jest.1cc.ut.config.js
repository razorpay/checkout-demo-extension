const jestConfig = require('./jest.ut.config.js');

module.exports = {
  ...jestConfig,
  roots: ['<rootDir>/app/modules/one_click_checkout'],
  modulePaths: ['<rootDir>/app/modules/one_click_checkout'],
  moduleDirectories: ['node_modules', 'app/modules'],
  collectCoverageFrom: [
    '<rootDir>/app/modules/one_click_checkout/**/*.{js,ts}',
  ],
  coverageDirectory: '<rootDir>/coverage/one_click_checkout/',
};
