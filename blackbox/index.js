require('./api');
const glob = require('glob').sync;
const puppeteer = require('puppeteer');

glob(__dirname + '/sites/*.js').forEach(async site => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: false
    // devtools: true,
  });
  const page = await browser.newPage();
  await require(site)(page);
  await page.goto('file://' + __dirname + '/index.html');
  setTimeout(() => {
    console.error('Payment not completed in 5s');
    process.exit(1);
  }, 5000);
});
