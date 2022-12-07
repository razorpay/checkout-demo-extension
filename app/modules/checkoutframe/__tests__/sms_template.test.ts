import { getSession } from 'sessionmanager';
import * as smsTemplate from 'checkoutframe/sms_template';
import * as history from 'one_click_checkout/routing/History';
import * as views from 'one_click_checkout/routing/constants';
import { isRedesignV15 } from 'razorpay/helper';
jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => {}),
}));
jest.mock('razorpay/helper', () => ({
  isRedesignV15: jest.fn(() => {}),
}));

Object.defineProperty(history, 'screensHistory', {
  value: {
    config: {
      otp: {
        props: {
          smsTemplate: 'save_address',
        },
      },
    },
  },
  writable: true,
});

const obj = {
  COUPONS: 'coupons',
  COUPONS_LIST: 'couponsList',
  SAVED_ADDRESSES: 'savedAddress',
  ADD_ADDRESS: 'addAddress',
  EDIT_ADDRESS: 'editAddress',
  ADDRESS: 'address',
  OTP: 'otp',
  DETAILS: 'details',
  BILLING_ADDRESS: 'billingAddress',
  ADD_BILLING_ADDRESS: 'addBillingAddress',
  SAVED_BILLING_ADDRESS: 'savedBillingAddress',
  EDIT_BILLING_ADDRESS: 'editBillingAddress',
  METHODS: 'methods',
};
Object.defineProperty(views, 'views', {
  value: obj,
  writable: true,
});

describe('Module: checkoutframe/sms_template', () => {
  it('should return save_card when getSession returns an object with payload', () => {
    (getSession as unknown as jest.Mock).mockReturnValue({
      payload: {
        save: 1,
      },
    });
    (isRedesignV15 as unknown as jest.Mock).mockReturnValue(true);
    expect(smsTemplate.getDefaultOtpTemplate()).toEqual('save_card');
  });
  it('should return access_card when getSession returns empty object', () => {
    (getSession as unknown as jest.Mock).mockReturnValue({});
    (isRedesignV15 as unknown as jest.Mock).mockReturnValue(true);
    expect(smsTemplate.getDefaultOtpTemplate()).toEqual('access_card');
  });
});
