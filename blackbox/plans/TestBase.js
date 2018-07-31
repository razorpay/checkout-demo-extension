const chalk = require('chalk');
const chai = require('chai');

let attempts = 0;

class Attempt {
  constructor(test) {
    this.id = String(attempts++);
    this.test = test;
  }

  end(result) {
    return new Promise(resolve => {
      let test = this.test;
      test.awaitingPaymentResult = resolve;
      if (result) {
        result = JSON.stringify(result);
        test.page.evaluate(`window.onComplete && onComplete(${result})`);
        test.page.evaluate(`__pptr_oncomplete(${result})`);
      }
    });
  }

  fail(description, field) {
    let error = {
      error: {
        description,
      },
    };
    if (field) {
      error.field = field;
    }
    return this.end(error);
  }

  succeed() {
    let paymentId = 'pay_' + Math.random();
    return this.end({ razorpay_payment_id: paymentId });
  }
}

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

  async newAttempt() {
    if (this.currentAttempt) {
      return this.fail('New payment attempted while previous was in process');
    }

    let a = new Attempt(this);

    this.currentAttempt = a;

    // set reference to pass it to poup
    this.page.target().__rzp_attempt_id = a.id;

    this.page.setExtraHTTPHeaders({
      'x-pptr-id': a.id,
    });

    return a;
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
