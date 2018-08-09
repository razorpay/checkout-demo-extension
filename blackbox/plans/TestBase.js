const chalk = require('chalk');
const chai = require('chai');
const Attempt = require('./Attempt');
const { apiUrl } = require('../util');

let visits = 0;

class TestBase {
  static async test(browser, message) {
    const page = await browser.newPage();
    await page.goto(apiUrl + '../static/index.html');

    let p = new this(page);

    await page.exposeFunction('__pptr_oncomplete', data => {
      if (!p.currentAttempt) {
        return p.fail('Payment completed without attempt', data);
      }

      var data = typeof data === 'object' ? data : JSON.parse(data);

      if (data.razorpay_payment_id) {
        p.currentAttempt.setState(Attempt.states.PAYMENT_SUCCESS);
        p.log(chalk.dim('payment successful: ' + data.razorpay_payment_id));
      } else {
        p.currentAttempt.setState(Attempt.states.PAYMENT_FAIL);
        let errorMessage = 'payment failed: ' + data.error.description;
        if (data.error.field) {
          errorMessage += ', field: ' + data.error.field;
        }
        p.log(chalk.dim(errorMessage));
      }

      p.currentAttempt.next();
      p.currentAttempt = null;
    });

    await p.loadScripts(message);

    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  newAttempt() {
    if (this.currentAttempt) {
      return this.fail('New payment attempted while previous was in process');
    }

    return (this.currentAttempt = new Attempt(this));
  }

  setCallbacks(resolve, reject) {
    this.pass = message => {
      if (this.currentAttempt) {
        this.fail(
          'Test ended before current payment attempt could be concluded'
        );
      }
      this.destroy();
      this.page.close();
      console.log(chalk.green(this.makeLog(message || '✔')));
      resolve();
    };
    this.fail = message => {
      this.destroy();
      console.log(chalk.red(this.makeLog(message || '✘')));
      reject();
    };
  }

  makeLog(...messages) {
    let name = this.constructor.TEST_PARENT + '/' + this.constructor.name + ' ';
    let prefix = chalk.yellow(name);
    let indent = Array(name.length + 1).join(' ');
    messages = messages.map((m, i) => {
      return i ? indent + m : prefix + m;
    });
    return messages.join('\n');
  }

  log(...messages) {
    console.log(this.makeLog(...messages));
  }

  logPass(message) {
    this.log(chalk.green(message));
  }

  constructor(page) {
    this.page = page;
    this.id = visits++;
    TestBase.allTests[this.id] = this;
    this.apiUrl = `${apiUrl}${this.id}/`;
    page.evaluate(`Razorpay = {
      config: {
        api: '${this.apiUrl}',
        frameApi: '${this.apiUrl}',
        frame: '/static/checkout.html'
      }
    }`);
    this.apiUrl += 'v1';
  }

  destroy() {
    delete TestBase.allTests[this.id];
  }

  async instantiateRazorpay(options) {
    return await this.page.evaluate(
      `var razorpay = new Razorpay(${JSON.stringify(options)})`
    );
  }

  assertMethod(message, method) {
    return (...args) => {
      try {
        method(...args);
        this.logPass(message);
      } catch (e) {
        this.fail(message + '\n\t' + e);
      }
    };
  }

  assert(message) {
    return new Proxy(
      {},
      {
        get: (obj, prop) => {
          let method = chai.assert[prop];
          return this.assertMethod(message, method);
        },
      }
    );
  }
}

TestBase.PARENT = '';
TestBase.allTests = {};
TestBase.apiUrl = apiUrl;

module.exports = TestBase;
