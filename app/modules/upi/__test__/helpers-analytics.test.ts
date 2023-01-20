import {
  triggerAnalyticsOnLoad,
  trackUPIAppsShown,
  trackUPIAppSelect,
} from 'upi/analytics/helpers';
import { UPITracker } from 'upi/analytics/events';
import { upiUxV1dot1 } from 'upi/experiments';
import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';
import { AnalyticsV2State } from 'analytics-v2';
import { triggerInstAnalytics } from 'home/analytics/helpers';
import { OTHER_INTENT_APPS } from 'upi/constants';

jest.mock('upi/analytics/events', () => {
  const originalModule = jest.requireActual('upi/analytics/events');

  return {
    __esModule: true,
    ...originalModule,
    UPITracker: {
      UPI_OTHER_APPS_SCREEN_LOADED: jest.fn(),
      UPI_APPS_SHOWN: jest.fn(),
      GEN_UPI_APPS_SHOWN: jest.fn(),
    },
  };
});

jest.mock('home/analytics/helpers', () => {
  const originalModule = jest.requireActual('home/analytics/helpers');

  return {
    __esModule: true,
    ...originalModule,
    triggerInstAnalytics: jest.fn(),
  };
});

jest.mock('upi/experiments', () => {
  const originalModule = jest.requireActual('upi/experiments');

  return {
    __esModule: true,
    ...originalModule,
    upiUxV1dot1: {
      enabled: jest.fn(),
    },
  };
});

jest.mock('upi/helper/upiUx', () => {
  const originalModule = jest.requireActual('upi/helper/upiUx');

  return {
    __esModule: true,
    ...originalModule,
    getLastUpiUxErroredPaymentApp: jest.fn(),
  };
});

const upiExp = upiUxV1dot1.enabled as jest.MockedFunction<
  typeof upiUxV1dot1.enabled
>;
const getLastUpiUxError = getLastUpiUxErroredPaymentApp as jest.MockedFunction<
  typeof getLastUpiUxErroredPaymentApp
>;

const showableApps = [
  {
    package_name: 'com.phonepe.app',
    app_icon: 'https://cdn.razorpay.com/checkout/phonepe.png',
    shortcode: 'phonepe',
    app_name: 'PhonePe',
    handles: ['ybl'],
  },
  {
    package_name: 'com.google.android.apps.nbu.paisa.user',
    app_name: 'Google Pay',
    app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
    handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
    verify_registration: true,
    shortcode: 'google_pay',
  },
  {
    package_name: 'net.one97.paytm',
    name: 'PayTM',
    app_name: 'PayTM UPI',
    shortcode: 'paytm',
    app_icon: 'https://cdn.razorpay.com/app/paytm.svg',
    handles: ['paytm'],
  },
];

const rowCol = [
  [
    ...showableApps,
    {
      package_name: 'other_intent_apps',
      app_name: 'Others',
      handles: [],
      name: 'Others',
      shortcode: 'others',
      app_icon:
        '<svg viewBox="0 0 21 24" xmlns="http://www.w3.org/2000/svg">\n<path d="M9.516 20.254l9.15-8.388-6.1-8.388-1.185 6.516 1.629 2.042-2.359 1.974-1.135 6.244zM12.809.412l8 11a1 1 0 0 1-.133 1.325l-12 11c-.707.648-1.831.027-1.66-.916l1.42-7.805 3.547-3.01-1.986-5.579 1.02-5.606c.157-.865 1.274-1.12 1.792-.41z" fill="#DADADA"/>\n     <path d="M5.566 3.479l-3.05 16.775 9.147-8.388-6.097-8.387zM5.809.412l7.997 11a1 1 0 0 1-.133 1.325l-11.997 11c-.706.648-1.831.027-1.66-.916l4-22C4.174-.044 5.292-.299 5.81.412z" fill="#949494"/>\n</svg>',
    },
  ],
];

const instrumentList = showableApps.map(({ shortcode }) => ({
  name: shortcode,
}));

describe('test triggerAnalyticsOnLoad method', () => {
  beforeEach(() => {
    AnalyticsV2State.selectedInstrumentForPayment = {
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'Others',
        saved: false,
        personalisation: false,
        type: 'intent',
      },
    };
  });
  it('should trigger respective UPI analytics events for intent flow on L1 screen.', () => {
    triggerAnalyticsOnLoad(showableApps);
    const instrument = [...instrumentList, { name: 'other_intent_upi_apps' }];
    expect(UPITracker.UPI_OTHER_APPS_SCREEN_LOADED).toHaveBeenCalledTimes(1);
    expect(UPITracker.UPI_OTHER_APPS_SCREEN_LOADED).toHaveBeenCalledWith({
      instrument,
      trigger_source: 'click_on_others',
    });
  });
  it('should trigger respective UPI analytics events for intent flow on L1 screen when UPI app fails.', () => {
    upiExp.mockReturnValue(true);
    getLastUpiUxError.mockReturnValue({
      package_name: 'net.one97.paytm',
      name: 'PayTM',
      app_name: 'PayTM UPI',
      shortcode: 'paytm',
      app_icon: 'https://cdn.razorpay.com/app/paytm.svg',
      handles: ['paytm'],
    });
    const instrument = [...instrumentList, { name: 'other_intent_upi_apps' }];
    triggerAnalyticsOnLoad(showableApps);
    expect(UPITracker.UPI_OTHER_APPS_SCREEN_LOADED).toHaveBeenCalledTimes(1);
    expect(UPITracker.UPI_OTHER_APPS_SCREEN_LOADED).toHaveBeenCalledWith({
      instrument,
      trigger_source: 'paytm_fail',
    });
  });
});
describe('test trackUPIAppsShown method', () => {
  it('should trigger respective UPI analytics events for intent flow on L0 screen.', () => {
    const screen = '';
    const instrument = [...instrumentList, { name: 'others' }];
    trackUPIAppsShown(rowCol, screen);
    expect(UPITracker.GEN_UPI_APPS_SHOWN).toHaveBeenCalledTimes(1);
    expect(UPITracker.GEN_UPI_APPS_SHOWN).toHaveBeenCalledWith({
      instrument,
    });
  });
  it('should trigger respective UPI analytics events for intent flow on L1 screen.', () => {
    const screen = 'upi';
    const instrument = [...instrumentList, { name: 'others' }];
    trackUPIAppsShown(rowCol, screen);
    expect(UPITracker.UPI_APPS_SHOWN).toHaveBeenCalledTimes(1);
    expect(UPITracker.UPI_APPS_SHOWN).toHaveBeenCalledWith({
      instrument,
    });
  });
});
describe('test trackUPIAppSelect method', () => {
  it('should update the selected instrument on AnalyticsV2state.', () => {
    const instrument = {
      _ungrouped: [
        {
          _type: 'method',
          code: 'upi',
          method: 'upi',
        },
      ],
      _type: 'method',
      code: 'upi',
      method: 'upi',
      id: 'a4e2f58f_rzp.cluster_1_1_upi_true',
      blockTitle: 'Cards, UPI & More',
      section: 'generic',
    };
    trackUPIAppSelect(instrument, OTHER_INTENT_APPS.app_name);
    expect(triggerInstAnalytics).not.toHaveBeenCalled();
    expect(AnalyticsV2State.selectedInstrumentForPayment).toMatchObject({
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'Others',
        saved: false,
        personalisation: false,
        type: 'intent',
      },
    });
  });
  it('should call triggerInstAnalytics for all UPI intent apps except other apps.', () => {
    const appName = 'Google Pay';
    const instrument = {
      _ungrouped: [
        {
          _type: 'method',
          code: 'upi',
          method: 'upi',
        },
      ],
      _type: 'method',
      code: 'upi',
      method: 'upi',
      id: 'a4e2f58f_rzp.cluster_1_1_upi_true',
      blockTitle: 'Cards, UPI & More',
      section: 'generic',
    };
    trackUPIAppSelect(instrument, appName);
    expect(triggerInstAnalytics).toHaveBeenCalledTimes(1);
  });
});
