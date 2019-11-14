const path = require('path');
const os = require('os');

module.exports = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
