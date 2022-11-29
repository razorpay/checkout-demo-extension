import fetch from 'utils/fetch';
import PaymentState from '../state';

jest.mock('fingerprint', () => ({
  __esModule: true,
  sha: (payload: any) => new Promise((res) => res(payload)),
}));

jest.mock('common/helper', () => ({
  __esModule: true,
  makeAuthUrl: (_: any, path: string) => path,
}));

jest.mock('utils/fetch');

const dummyRequest = {
  method: 'upi',
  email: 'test@example.com',
  phone: '8888888888',
  _metaData: 'data',
};
const response = { success: true, payment_id: 'helloworld' };

describe('test PaymentState', () => {
  beforeEach(() => {
    PaymentState.persistentState.clear();
  });
  test('#setPersistentState', async () => {
    await PaymentState.setPersistentState(dummyRequest, response);
    expect(PaymentState.persistentState.size).toBe(1);
    const key = {
      email: 'test@example.com',
      method: 'upi',
      phone: '8888888888',
    };
    expect(PaymentState.persistentState.has(JSON.stringify(key))).toBeTruthy();
  });

  test('#setPersistentState with _[app]', async () => {
    await PaymentState.setPersistentState(
      { ...dummyRequest, '_[app]': 'com.test' },
      response
    );
    expect(PaymentState.persistentState.size).toBe(1);
    const key = {
      '_[app]': 'com.test',
      email: 'test@example.com',
      method: 'upi',
      phone: '8888888888',
    };
    expect(PaymentState.persistentState.has(JSON.stringify(key))).toBeTruthy();
  });

  test('#setPersistentState error response', async () => {
    const errorRes = {
      error: {
        description: 'Network error',
      },
      xhr: {
        status: 0,
      },
    };
    await expect(PaymentState.setPersistentState(dummyRequest, errorRes)).toBe(
      undefined
    );
  });

  test('#getPersistentPayment', async () => {
    //setting up
    await PaymentState.setPersistentState(dummyRequest, response);
    const data = await PaymentState.getPersistentPayment(dummyRequest);
    expect(data).toMatchObject(response);
  });

  test('#getPersistentPayment with extra metadata', async () => {
    //setting up
    await PaymentState.setPersistentState(
      { ...dummyRequest, _source: 'checkout' },
      response
    );
    const persistentState = new Map();
    persistentState.set(
      '{"email":"test@example.com","method":"upi","phone":"8888888888"}',
      {
        response: { success: true, payment_id: 'helloworld' },
      }
    );
    const data = await PaymentState.getPersistentPayment.call(
      { persistentState },
      dummyRequest
    );
    expect(data).toBeNull();
  });
  test('#getPersistentPayment with extra metadata', async () => {
    //setting up
    await PaymentState.setPersistentState(
      { ...dummyRequest, _source: 'checkout' },
      response
    );
    const data = await PaymentState.getPersistentPayment(dummyRequest);
    expect(data).toMatchObject(response);
  });
  test('#getPersistentPayment with different request', async () => {
    //setting up
    await PaymentState.setPersistentState(
      { ...dummyRequest, source: 'checkout' },
      response
    );
    const data = await PaymentState.getPersistentPayment(dummyRequest);
    expect(data).toBeNull();
  });

  test('#cancelAllPayments', async () => {
    //setting up
    await PaymentState.setPersistentState(
      { ...dummyRequest, source: 'checkout' },
      response
    );
    PaymentState.cancelAllPayments();
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `payments/${response.payment_id}/cancel`,
      })
    );
  });
});
