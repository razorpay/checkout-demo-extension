import {
  assertPaymentSuccessMetadata,
  raiseValidationError,
  popupIframeCheck,
} from 'payment/helper';
import { capture } from 'error-service';
import { getPaymentEntity, getKey } from 'razorpay';
import * as useragent from 'common/useragent';
import { submitForm } from 'common/form';

jest.mock('error-service', () => ({
  ...jest.requireActual('error-service'),
  __esModule: true,
  capture: jest.fn(),
}));

jest.mock('payment/helper', () => ({
  ...jest.requireActual('payment/helper'),
  __esModule: true,
  raiseValidationError: jest.fn(),
}));

jest.mock('common/form', () => ({
  __esModule: true,
  submitForm: jest.fn(),
}));

jest.mock('payment/utils', () => ({
  ...jest.requireActual('payment/utils'),
  __esModule: true,
  checkValidFlow: jest.fn(() => true),
}));

jest.mock('razorpay', () => ({
  __esModule: true,
  getKey: jest.fn(() => 'rzp_test_1DP5mmOlF5G5ag'),
  getAmount: jest.fn(),
  getCurrency: jest.fn(),
  getPaymentEntity: jest.fn(() => 'order'),
}));

describe('Test popupIframeCheck', () => {
  test('should return true if the view is mobile web', () => {
    (useragent as any).iOS = true;
    const context = {
      popup: {
        window: {
          document: global.document,
          history: global.history,
        },
      },
    };
    const request = {
      url: 'https://razorpay.com',
      content: {},
      method: 'post',
    };
    expect(popupIframeCheck(context, request)).toBe(true);
    expect(submitForm).toHaveBeenCalledTimes(1);
  });
  test('should return false if the view is not mobile web', () => {
    (useragent as any).iOS = false;
    const context = {
      popup: {
        window: { document: global.document },
      },
    };
    expect(popupIframeCheck(context)).toBe(false);
  });
  test('should return false if document.write method is invalid', () => {
    const context = {
      popup: {
        window: { document: { write: '' } },
      },
    };
    expect(popupIframeCheck(context)).toBe(false);
  });
});
describe('Test assertPaymentSuccessMetadata', () => {
  test('Assert payment success meta for data without order id & signature', () => {
    assertPaymentSuccessMetadata({ razorpay_payment_id: 'pay_KhNBDepLcpE8fH' });
    expect(raiseValidationError).not.toHaveBeenCalled();
  });
  test('Assert payment success meta for data with order id & signature', () => {
    assertPaymentSuccessMetadata({
      razorpay_payment_id: 'pay_KhNLFHLKcbw17m',
      razorpay_order_id: 'order_KhNHfVdM5mRXMn',
      razorpay_signature:
        '15c4e534045ae53006e9e3d761a8127e2b94c998473a9b1fe6f34ed13941d735',
    });
    expect(getKey).toHaveBeenCalled();
    expect(raiseValidationError).not.toHaveBeenCalled();
  });
  test('Assert payment success meta for data without razorpay signature', () => {
    assertPaymentSuccessMetadata({
      razorpay_payment_id: 'pay_KhNLFHLKcbw17m',
      razorpay_order_id: 'order_KhNHfVdM5mRXMn',
    });
    expect(getKey).toHaveBeenCalled();
    expect(capture).toHaveBeenCalledTimes(1);
  });
  test('Assert payment success meta for data with invalid order id', () => {
    assertPaymentSuccessMetadata({
      razorpay_payment_id: 'pay_KhNLFHLKcbw17m',
      razorpay_order_id: '',
      razorpay_signature:
        '15c4e534045ae53006e9e3d761a8127e2b94c998473a9b1fe6f34ed13941d735',
    });
    expect(getPaymentEntity).toHaveBeenCalled();
    expect(capture).toHaveBeenCalled();
  });
  test('should return undefined if we not passed data to assertPaymentSuccessMetadata', () => {
    expect(assertPaymentSuccessMetadata()).toBe(undefined);
  });
  test('Assert payment success meta for data for invalid payment entity', () => {
    (getPaymentEntity as any).mockReturnValue('');
    expect(
      assertPaymentSuccessMetadata({
        razorpay_payment_id: 'pay_KhNBDepLcpE8fH',
      })
    ).toBe(undefined);
  });
});
