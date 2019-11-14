const { execSync } = require('child_process');
const DIR = require('./tmpdir');

module.exports = async function() {
  // close the browser instance
  await global.__BROWSER_GLOBAL__.close();

  // clean-up the wsEndpoint file
  execSync(`rm -rf ${DIR}`);
};
