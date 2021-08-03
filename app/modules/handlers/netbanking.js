import { replaceRetryButtonToDismissErrorMessage } from './common';

const AUTH_PENDING_MSG =
  'Payment is pending authorization. Request for authorization from approver.';

/**
 * If error code exists and matches the string, removed the retry button
 * and replaces it with ok button, which closes checkout.
 * @param {Session} session
 * @param {string} message
 */
export function replaceRetryIfCorporateNetbanking(session, message) {
  if (message === AUTH_PENDING_MSG) {
    session.isCorporateBanking = true;

    replaceRetryButtonToDismissErrorMessage(session, 'OK');
  } else {
    _Doc.querySelector('#fd-hide').focus();
  }
}
