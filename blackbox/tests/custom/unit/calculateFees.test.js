const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

const calculateFeesPayload = {
  amount: 6000,
  'card[cvv]': '123',
  'card[expiry]': '11 / 22',
  'card[name]': 'arshpreet',
  'card[number]': '4111111111111111',
  contact: '+919999999999',
  currency: 'INR',
  email: 'qa.testing@razorpay.com',
  method: 'card',
  save: 1,
};

describe('calculateFees - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('get Fees', async () => {
    /**
     * Expected preference response in callback
     */
    const calculateFeesPromise = page.evaluate(async payload => {
      return await window.rp.calculateFees(payload);
    }, calculateFeesPayload);
    await context.expectRequest(req => {});
    await context.respondJSON(mockAPI.calculateFees());
    const feesResponse = await calculateFeesPromise;
    expect(feesResponse.input.amount).toBe(6120);
    expect(feesResponse.input.fee).toBe(120);
    expect(feesResponse.input.method).toBe('card');
    expect(feesResponse.display.amount).toBe(61.2);
    expect(feesResponse.display.fees).toBe(1.2);
  });
});
