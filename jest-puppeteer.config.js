module.exports = {
  launch: {
    headless: true,
    slowMo: 0,
    timeout: 0,
    executablePath:
      process.env.CHROME_BIN ||
      `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`,
  },
};
