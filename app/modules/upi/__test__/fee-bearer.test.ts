import { handleFeeBearer } from '../helper/fee-bearer';

jest.mock('navstack', () => ({
  pushOverlay: jest.fn(),
}));

const argumentData = {
  contact: '+918888888888',
  email: 'harshil@razorpay.com',
  amount: 100,
  method: 'upi',
  '_[flow]': 'intent',
};

const mockAPIResponse = {
  input: {
    contact: '+918888888888',
    email: 'harshil@razorpay.com',
    amount: 102,
    method: 'upi',
    _: {
      flow: 'intent',
      shield: { fhash: 'b593005a8672e4ecf37b5a402c67a3c447d034e4', tz: '330' },
      device_id:
        '1.f66e640403baead0c2718eb27aebe580de325842.1643776027228.00371541',
      build: '0',
      checkout_id: 'J275EJ3jiCSo6w',
      env: 'undefined',
      library: 'checkoutjs',
      platform: 'browser',
      referer: 'http://localhost:8000/',
    },
    currency: 'INR',
    description: 'JEE Main & Advanced',
    fee: 2,
  },
  display: {
    originalAmount: 1,
    original_amount: 1,
    fees: 0.02,
    razorpay_fee: 0.02,
    tax: 0,
    amount: 1.02,
  },
  error: {
    code: 'BAD_REQUEST_ERROR',
    description: 'Unable to load fee-bearkup ',
    source: 'customer',
  },
};
jest.mock('sessionmanager', () => ({
  getSession: () => ({
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
    showOverlay: jest.fn(),
    hideOverlay: jest.fn(),
    get: jest.fn(),
    getAppliedOffer: jest.fn(),
    showLoader: jest.fn(),
    showLoadError: jest.fn(),
    updateAmountInHeader: jest.fn(),
    r: {
      calculateFees: () => {
        return Promise.resolve(mockAPIResponse);
      },
    },
  }),
}));

let spy;
beforeAll(() => {
  spy = jest.spyOn(document, 'getElementById');
});

describe('handleFeeBearer tests', () => {
  test('should properly load the fee-bearer modal', async () => {
    const callback = (data: any) => {};
    handleFeeBearer(argumentData as Partial<UPI.UPIPaymentPayload>, callback);
    document.querySelector('.fee-bearer')?.dispatchEvent(new Event('continue'));
    document.dispatchEvent(new Event('error'));
  });
});
