import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

/**
 * Tracks the vpas available when UPI Intent Instrument was shown on the desktop.
 * @param {String} vendor_vpas
 */
export const trackUpiIntentInstrumentAvailable = vendor_vpas => {
  Analytics.track('upi:intent_instrument_on_desktop_available', {
    type: AnalyticsTypes.METRIC,
    data: {
      vendor_vpas,
    },
  });
};

/**
 * Tracks the UPI Intent Instrument vpa selected by the user on the desktop.
 * @param {String} vendor_vpa 
 */
export const trackUpiIntentInstrumentSelected = vendor_vpa => {
  Analytics.track('upi:intent_instrument_on_desktop_selected', {
    type: AnalyticsTypes.BEHAV,
    data: {
      vendor_vpa,
    },
  });
};

/**
 * Tracks the payment attempted with or without highlighted UPI Intent instrument.
 * @param {String} is_from_experiment_instrument 
 */
 export const trackUpiIntentInstrumentPaymentAttempted = is_from_experiment_instrument => {
  Analytics.track('upi:intent_instrument_on_desktop_payment_attempted', {
    type: AnalyticsTypes.BEHAV,
    data: {
      is_from_experiment_instrument,
    },
  });
};