const jestConfig = require('./jest.ut.config.js');

delete jestConfig.coverageThreshold;

module.exports = {
  ...jestConfig,
  roots: ['<rootDir>/app/modules'],
  modulePaths: ['<rootDir>/app/modules'],
  moduleDirectories: ['node_modules', 'app/modules'],
  collectCoverageFrom: ['<rootDir>/app/modules/one_click_checkout/**/*.*'],
  coverageDirectory: '<rootDir>/coverage/one_click_checkout/',
};
