import {
  trackUpiIntentInstrumentAvailable,
  trackUpiIntentInstrumentSelected,
  trackUpiIntentInstrumentPaymentAttempted,
} from '../helper/highlight-upi-intent';

import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

Analytics.track = jest.fn();

describe('UPI analytics helper', () => {
  it('should track if intent instrument is available', () => {
    trackUpiIntentInstrumentAvailable(['@ybl', '@oksbi']);
    expect(Analytics.track).toHaveBeenCalledWith(
      'intent_instrument_on_desktop_available',
      {
        type: AnalyticsTypes.METRIC,
        data: {
          vendor_vpas: ['@ybl', '@oksbi'],
        },
      }
    );
  });

  it('should track if intent instrument is selected', () => {
    trackUpiIntentInstrumentSelected('@ybl');
    expect(Analytics.track).toHaveBeenCalledWith(
      'intent_instrument_on_desktop_selected',
      {
        type: AnalyticsTypes.BEHAV,
        data: {
          vendor_vpa: '@ybl',
        },
      }
    );
  });

  it('should track if intent instrument is selected', () => {
    trackUpiIntentInstrumentPaymentAttempted(true);
    expect(Analytics.track).toHaveBeenCalledWith(
      'intent_instrument_on_desktop_payment_attempted',
      {
        type: AnalyticsTypes.BEHAV,
        data: {
          is_from_intent_instrument: true,
        },
      }
    );
  });
});
