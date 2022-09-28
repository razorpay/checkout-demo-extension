import { AnalyticsV2State } from 'analytics-v2';

jest.mock('checkoutstore/screens/home', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('checkoutstore/screens/home');
  return {
    __esModule: true,
    ...originalModule,
    selectedBlock: writable(),
  };
});

describe('test analyticsV2 store getter and setter', () => {
  test('#selectedInstrumentForPayment', () => {
    const data = {
      method: { name: 'netbanking' },
      instrument: { name: 'SBIN', personalisation: false, saved: false },
    };
    AnalyticsV2State.selectedInstrumentForPayment = data;
    expect(AnalyticsV2State.selectedInstrumentForPayment).toStrictEqual(data);
  });
  test('#checkoutInvokedTime', () => {
    const data = Date.now();
    AnalyticsV2State.checkoutInvokedTime = data;
    expect(AnalyticsV2State.checkoutInvokedTime).toStrictEqual(data);
  });

  test('#selectedBlock', () => {
    const data = { category: 'Generic', name: 'Cards UPI and More' };
    AnalyticsV2State.selectedBlock = data;
    expect(AnalyticsV2State.selectedBlock).toStrictEqual(data);
  });
});
