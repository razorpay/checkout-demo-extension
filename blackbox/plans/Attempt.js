const chalk = require('chalk');
const { delay } = require('../util');
let attempts = 0;

class Attempt {
  promisePending(action, request) {
    return new Promise(resolve => this.setPending(action, resolve, request));
  }

  setPending(action, resolve, request) {
    // console.log(action + ' set');
    this.pending[action] = resolve;
    this.request[action] = request;
  }

  call(action, data) {
    // might need await here if doesn't work
    let cb = this.pending[action];
    if (cb) {
      // console.log('reply called')
      this.pending[action] = null;
      this.request[action] = null;
      cb(data);
    } else {
      this.fail(`No ${action} action to perform`);
    }
  }

  getRequest(action = 'reply') {
    return this.request[action];
  }

  reply(data) {
    this.call('reply', data);
  }

  next() {
    this.call('next');
  }

  warn(msg) {
    this.test.log(chalk.bgYellow(msg));
  }

  setState(s) {
    this.state = s;
  }

  constructor(test) {
    this.test = test;
    this.id = String(attempts++);
    this.paymentId = 'pay_' + test.id + '_' + this.id;
    this.pending = {};
    this.request = {};
    this.setState('new attempt ' + this.paymentId);
  }

  async end(result) {
    if (this.done) {
      this.test.fail('Tried to end payment attempt more than once');
    }
    await delay(100);
    this.done = true;
    this.reply(result);

    return this.promisePending('next');
  }

  fail(description, field) {
    let error = {
      error: {
        description,
      },
    };
    if (field) {
      error.error.field = field;
    }
    return this.end(error);
  }

  succeed() {
    return this.end({ razorpay_payment_id: this.paymentId });
  }

  acs() {
    let paymentId = this.paymentId;

    this.reply({
      type: 'first',
      request: {
        url: `${this.test.apiUrl}/gateway/mocksharp/${paymentId}`,
        content: {
          paymentId,
        },
        method: 'get',
      },
      paymentId,
    });

    return this.promisePending('next');
  }

  async askOtp() {
    await delay(100);

    let paymentId = this.paymentId;

    this.reply({
      type: 'otp',
      request: {
        url: `${this.test.apiUrl}/payments/${paymentId}/otp_submit`,
        method: 'post',
        content: [],
      },
      paymentId,
    });

    await delay(1000);
  }

  assertSuccess() {
    this.test
      .assert('Payment was successful')
      .equal(Attempt.states.PAYMENT_SUCCESS, this.state);
  }

  assertFail() {
    this.assert('Payment failed').equal(
      Attempt.states.PAYMENT_FAIL,
      this.state
    );
  }
}

Attempt.states = {
  PAYMENT_SUCCESS: 'payment successful',
  PAYMENT_FAIL: 'payment failed',
  PAYMENT_CREATE: 'payment created',
};

module.exports = Attempt;
