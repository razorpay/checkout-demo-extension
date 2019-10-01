const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  launch: {
    headless: isProd,
    slowMo: isProd ? 0 : 10,
    timeout: 3000,
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
  },
};
