import { processPaymentCreate } from 'payment/coproto';
import { popupIframeCheck } from 'payment/helper';
import { submitForm } from 'common/form';
import { payloadData } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(() => true),
  getMode: jest.fn(),
};

jest.mock('payment/helper', () => ({
  __esModule: true,
  popupIframeCheck: jest.fn(),
}));

jest.mock('common/form', () => ({
  __esModule: true,
  submitForm: jest.fn(),
}));

const response = {
  type: 'first',
  request: {
    content: {
      encdata: 'MTIzNDU2Nzg5MDEyMzQ1NhzChGiRkiZGPs7',
      merchant_code: 'RAZORPAY',
    },
    method: 'POST',
    url: 'https://merchant.onlinesbi.sbi/merchant/merchantprelogin.htm',
  },
  version: 1,
  payment_id: 'pay_KkeUsnvwyoGbNl',
  gateway: 'eyJpdiI6Ino2MW02T1ZoaHpHMnhBWjc',
  amount: '₹ 50',
  image: null,
  magic: false,
  status_code: 200,
};

const data = {
  ...payloadData,
  method: 'netbanking',
  bank: 'SBIN',
};

describe('Test processPaymentCreate', () => {
  test('Test processPaymentCreate for popup flow', () => {
    const popup = {
      interval: 74,
      name: 'popup_Kkx7TWpZCYLWWj',
      onClose: () => {},
    };
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    processPaymentCreate.call({ popup, emit, checkRedirect, data }, response);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(popupIframeCheck).toHaveBeenCalledTimes(1);
    expect(submitForm).toHaveBeenCalledTimes(1);
    expect(submitForm).toHaveBeenCalledWith({
      doc: window.document,
      url: 'https://merchant.onlinesbi.sbi/merchant/merchantprelogin.htm',
      params: {
        encdata: 'MTIzNDU2Nzg5MDEyMzQ1NhzChGiRkiZGPs7',
        merchant_code: 'RAZORPAY',
      },
      method: 'POST',
      target: 'popup_Kkx7TWpZCYLWWj',
    });
  });
  test('Test processPaymentCreate for redirect flow', () => {
    const popup = {
      interval: 74,
      name: 'popup_Kkx7TWpZCYLWWj',
      onClose: () => {},
    };
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    const nativeotp = true;
    const redirect = jest.fn();
    processPaymentCreate.call(
      {
        popup,
        emit,
        checkRedirect,
        data,
        nativeotp,
        r: razorpayInstance,
        redirect,
      },
      response
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(response.request);
  });
  test('Test processPaymentCreate for redirect 3ds flow', () => {
    const popup = {
      interval: 74,
      name: 'popup_Kkx7TWpZCYLWWj',
      onClose: () => {},
    };
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    const tryPopup = jest.fn();
    const writePopup = jest.fn();
    const nativeotp = true;
    const data = {
      ...payloadData,
      method: 'app',
      provider: 'cred',
    };
    razorpayInstance.get = jest.fn();
    processPaymentCreate.call(
      {
        popup,
        emit,
        checkRedirect,
        data,
        nativeotp,
        r: razorpayInstance,
        tryPopup,
        writePopup,
      },
      response
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(emit).toHaveBeenCalledWith('3ds.required');
  });
  test('Test processPaymentCreate for redirect flow', () => {
    response.request.method = 'direct';
    const popup = {
      interval: 74,
      name: 'popup_Kkx7TWpZCYLWWj',
      onClose: () => {},
    };
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    const nativeotp = true;
    razorpayInstance.get = jest.fn();
    processPaymentCreate.call(
      {
        popup,
        emit,
        checkRedirect,
        data,
        nativeotp,
        r: razorpayInstance,
      },
      response
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(emit).toHaveBeenCalledWith('3ds.required');
  });
});
