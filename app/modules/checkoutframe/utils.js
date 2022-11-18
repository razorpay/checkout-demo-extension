import Analytics, { Events } from 'analytics';
import { isStandardCheckout } from 'common/helper';
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
