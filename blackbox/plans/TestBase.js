const chalk = require('chalk');
const chai = require('chai');

class TestBase {
  static async test(browser, message) {
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/../index.html');

    let p = new this(page);

    await page.exposeFunction('__pptr_oncomplete', data => {
      var data = typeof data === 'object' ? data : JSON.parse(data);

      if (data.razorpay_payment_id) {
        p.log(chalk.dim('payment successful: ' + data.razorpay_payment_id));
      } else {
        let errorMessage = 'payment failed: ' + data.error.description;
        if (data.error.field) {
          errorMessage += ', field: ' + data.error.field;
        }
        p.log(chalk.dim(errorMessage));
      }

      if (p.awaitingPaymentResult) {
        p.awaitingPaymentResult(data);
      }
    });

    await p.loadScripts(message);

    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  setCallbacks(resolve, reject) {
    this.pass = message => {
      this.page.close();
      console.log(chalk.green(this.makeLog(message || '✔')));
      resolve();
    };
    this.fail = message => {
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

  constructor(page) {
    this.page = page;
  }

  async instantiateRazorpay(options) {
    return await this.page.evaluate(
      `var razorpay = new Razorpay(${JSON.stringify(options)})`
    );
  }

  paymentResult(result) {
    return new Promise(resolve => {
      this.awaitingPaymentResult = resolve;
      if (result) {
        result = JSON.stringify(result);
        this.page.evaluate(`window.onComplete && onComplete(${result})`);
        this.page.evaluate(`__pptr_oncomplete(${result})`);
      }
    });
  }

  paymentFailed(message) {
    return this.paymentResult({ error: { description: message } });
  }

  paymentSuccessful() {
    let paymentId = 'pay_' + Math.random();
    return this.paymentResult({ razorpay_payment_id: paymentId });
  }

  assertMethod(message, method) {
    return (...args) => {
      try {
        method(...args);
        this.log(chalk.green(message));
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

module.exports = TestBase;
