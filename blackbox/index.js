require('./api');
const glob = require('glob').sync;
const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

glob(__dirname + '/sites/*/index.html').forEach(async site => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox']
    // headless: false,
    // devtools: true,
  });
  const page = await browser.newPage();
  await page.exposeFunction('completeHandler', data => {
    if (JSON.parse(data).razorpay_payment_id) {
      browser.close();
      console.log('wallet payment passed');
      process.exit();
    }
  });
  await page.exposeFunction('renderHandler', async () => {
    await page.click('label[for=wallet-radio-mobikwik]');
    await delay(250);
    await page.click('.pay-btn');
    await delay(1000);
    await page.click('#otp');
    await page.keyboard.type('123456');
    await page.click('.otp-btn');
  });
  await page.goto('file://' + site);
  setTimeout(() => {
    console.error('Payment not completed in 5s');
    process.exit(1);
  }, 5000);
});
