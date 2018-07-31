const chalk = require('chalk');
const apiUrl = 'http://localhost:3000/api/';

let attempts = 0;
let visits = 0;

class Attempt {
  constructor(test) {
    this.id = String(attempts++);
    this.test = test;
  }

  end(result) {
    if (this.done) {
      this.test.fail('Tried to end payment attempt more than once');
    }
    this.done = true;
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

  constructor(page) {
    this.page = page;
    this.id = visits++;
    TestBase.allTests[this.id] = this;
    page.evaluate(`Razorpay = {
      config: {
        api: '${apiUrl}${this.id}/',
        frameApi: '${apiUrl}${this.id}/',
      }
    }`);
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
TestBase.allTests = {};

module.exports = TestBase;
