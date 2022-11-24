import Analytics, { Events } from 'analytics';
import browserstorage from 'browserstorage';
import { cookieDisabled } from 'common/constants';
import { isStandardCheckout } from 'common/helper';
import { getSdkMetaForRequestPayload, makePrefParams } from 'common/Razorpay';
import fetch from 'utils/fetch';
import { isEmpty, unflatten } from 'utils/object';
import * as _ from 'utils/_';

/**
 * Set all the necessary values to fetch, so that these values get
 * appended on every XHR or jsonp request as query param
 * @param {Object} session
 */
export function setParamsForDdosProtection(session) {
  if (!isEmpty(session)) {
    fetch.setKeylessHeader(session.r.get('keyless_header'));
  }

  const qpmap = unflatten(_.getQueryParams());

  if (isStandardCheckout() && qpmap?.captcha_id) {
    Analytics.setMeta('captcha_id', qpmap.captcha_id);
  }

  if (isStandardCheckout() && qpmap?.session_token) {
    global.session_token = qpmap.session_token;
    Analytics.setMeta('session_token_available', true);
  }
}

export function markRelevantPreferencesPayload(prefData) {
  const preferencesPayloadToBeMarked = [
    'subscription_id',
    'order_id',
    'key_id',
  ];
  preferencesPayloadToBeMarked.forEach((prop) => {
    if (prefData[prop]) {
      Events.setMeta(prop, prefData[prop]);
    }
  });
}

export function getPreferencesParams(razorpayInstance) {
  const prefData = makePrefParams(razorpayInstance);
  prefData.personalisation = 1;
  if (cookieDisabled) {
    prefData.checkcookie = 0;
  } else {
    /* set test cookie
     * if it is not reflected at backend while fetching prefs, disable
     * cardsaving */
    prefData.checkcookie = 1;
    document.cookie = 'checkcookie=1;path=/';
  }
  // TODO: make this a const
  const CREDExperiment = browserstorage.getItem('cred_offer_experiment');
  if (CREDExperiment) {
    prefData.cred_offer_experiment = CREDExperiment;
  }
  const sdk_meta = getSdkMetaForRequestPayload();
  if (sdk_meta) {
    prefData.sdk_meta = sdk_meta;
  }

  markRelevantPreferencesPayload(prefData);

  return prefData;
}
