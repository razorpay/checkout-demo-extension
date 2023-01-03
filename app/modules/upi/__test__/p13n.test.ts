import { handlep13nUpiIntent } from 'upi/helper/p13n';
import { handleUPIPayments } from 'upi/payment';
import { showDowntimeAlert } from 'checkoutframe/downtimes/utils';
import { get } from 'svelte/store';
import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import {
  getDowntimeForUPIApp,
  definePlatformReturnMethodIdentifier,
} from 'upi/helper';

jest.mock('checkoutframe/downtimes/utils', () => ({
  showDowntimeAlert: jest.fn(),
}));

jest.mock('upi/payment', () => ({
  handleUPIPayments: jest.fn(),
}));

jest.mock('upi/helper', () => ({
  getDowntimeForUPIApp: jest.fn(),
  definePlatformReturnMethodIdentifier: jest.fn(() => {
    return () => 'deepLinkIntent';
  }),
}));

jest.mock('upi/features', () => ({
  getRecommendedAppsForUPIStack: jest.fn(() => {
    return [
      {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
    ];
  }),
}));

const p13nInstrument = {
  _ungrouped: [
    {
      app: 'com.google.android.apps.nbu.paisa.user',
      flow: 'intent',
      method: 'upi',
      meta: {
        preferred: true,
      },
    },
  ],
  method: 'upi',
  flows: ['intent'],
  apps: ['com.google.android.apps.nbu.paisa.user'],
  meta: {
    preferred: true,
  },
  id: 'ba6693da_rzp.preferred_0_1_upi_false',
  skipCTAClick: false,
  section: 'p13n',
  blockTitle: 'Preferred Payment Methods',
};

describe('Test handlep13nUpiIntent', () => {
  test('Test if callback is set', () => {
    expect(get(selectedUPIAppForPay).callbackOnPay).toBeFalsy();
    handlep13nUpiIntent(p13nInstrument);
    expect(get(selectedUPIAppForPay).callbackOnPay).toBeTruthy();
  });
  test('Test handleUPIPayments to be called', () => {
    handlep13nUpiIntent(p13nInstrument);
    const selectedUPIApp = get(selectedUPIAppForPay);
    selectedUPIApp.callbackOnPay();
    expect(handleUPIPayments).toHaveBeenCalledTimes(1);
    expect(selectedUPIApp).toHaveProperty('source', 'p13n');
  });
  test('Test handlep13nUpiIntent with high downtime', () => {
    (getDowntimeForUPIApp as any).mockReturnValueOnce({
      downtimeInstrument: 'google_pay',
      severe: 'high',
    });

    handlep13nUpiIntent(p13nInstrument);
    const selectedUPIApp = get(selectedUPIAppForPay);
    selectedUPIApp.callbackOnPay();
    expect(showDowntimeAlert).toHaveBeenCalled();
  });

  test('Test handlep13nUpiIntent with medium downtime', () => {
    (getDowntimeForUPIApp as any).mockReturnValueOnce({
      downtimeInstrument: 'google_pay',
      severe: 'medium',
    });
    handlep13nUpiIntent(p13nInstrument);
    const selectedUPIApp = get(selectedUPIAppForPay);
    selectedUPIApp.callbackOnPay();
    expect(showDowntimeAlert).not.toHaveBeenCalled();
  });
});
