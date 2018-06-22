const chalk = require('chalk');

class CheckoutFrameTest {
  static async test(browser, message) {
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/../index.html');

    let p = new this(page);

    await page.exposeFunction('__pptr_oncomplete', data => {
      data = JSON.parse(data);
      if (data.razorpay_payment_id) {
        p.log(chalk.dim('payment successful: ' + data.razorpay_payment_id));
      } else {
        let errorMessage = 'payment failed: ' + data.error.description;
        if (data.error.field) {
          errorMessage +=
            '\n' +
            Array(path.basename(__filename, '.js')).join(' ') +
            'field: ' +
            data.error.field;
        }
        p.log(chalk.dim(errorMessage));
      }
      if (p.awaitingPaymentResult) {
        p.awaitingPaymentResult(data);
      }
    });

    await page.exposeFunction('__pptr_onrender', () => {
      p.render().catch(e => {
        p.log(chalk.dim(e));
        p.fail();
      });
    });

    await page.evaluate(`
      CheckoutBridge = {
        oncomplete: __pptr_oncomplete,
        onrender: __pptr_onrender
      }
    `);

    await p.loadScripts(page);

    await page.evaluate(`handleMessage(${JSON.stringify(message)})`);
    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  setCallbacks(resolve, reject) {
    this.pass = message => {
      this.page.close();
      resolve(this.makeLog(message || '✔'));
    };
    this.fail = message => {
      reject(this.makeLog(message || '✘'));
    };
  }

  makeLog(...messages) {
    let name = this.constructor.name + ' ';
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

  paymentResult() {
    return new Promise(resolve => {
      this.awaitingPaymentResult = resolve;
    });
  }

  async loadScripts() {
    await this.page.addScriptTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/checkout-frame.js'
    });
    await this.page.addStyleTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/css/checkout.css'
    });
  }
}

module.exports = CheckoutFrameTest;
