const argv = require('fe/argv');
const glob = require('glob').sync;
const chalk = require('chalk');
const puppeteer = require('puppeteer-core');
const { delay } = require('./util');

// if extra CLI arg is passed, run in single test mode. skip other tests
const singleTest = argv._[0];
const tests = glob(singleTest || 'blackbox/tests/**/*.js', { absolute: true });

// test grouping
groups = [];
test = function(testName, testFunction) {
  this.tests.push({ testName, testFunction });
};

describe = function(groupName, collectionClosure) {
  this.tests = [];
  test.bind(this);
  collectionClosure();
  groups.push({ groupName, tests: this.tests });
  //executing all tests
  setTimeout(() => {
    debugger;
  }, 200);
};

for (let path in tests) {
  require(tests[path]);
}

puppeteer
  .launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: false,
    // devtools: argv.devtools,
  })
  .then(async browser => {
    (await browser.pages())[0].close();
    for (let groupIdx in groups) {
      let testGroup = groups[groupIdx];
      console.log(chalk.green(testGroup.groupName));
      for (let testIdx in testGroup.tests) {
        let test = testGroup.tests[testIdx];
        console.log(chalk.cyanBright(`\t${test.testName}`));
        var context = await browser.createIncognitoBrowserContext();
        var page = await context.newPage();
        await delay(100);
        try {
          await test.testFunction(page);
        } catch (e) {
          console.error('broken-------');
          console.error(e);
        }
      }
    }
    await browser.close();
  });
