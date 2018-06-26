const chalk = require('chalk');

class TestBase {
  static async test(browser, message) {}

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
    let prefix = chalk.bold(name);
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

  paymentResult() {
    return new Promise(resolve => {
      this.awaitingPaymentResult = resolve;
    });
  }
}

TestBase.PARENT = '';

module.exports = TestBase;
