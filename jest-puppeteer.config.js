module.exports = {
  launch: {
    headless: true,
    slowMo: 10,
    timeout: 3000,
    executablePath:
      process.env.CHROME_BIN ||
      `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`,
  },
};
