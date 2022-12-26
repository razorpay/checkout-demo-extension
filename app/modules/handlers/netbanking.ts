import { updateActionAreaContentAndCTA } from './common';
import { querySelector } from 'utils/doc';
import type { SessionType } from 'types/types';

const AUTH_PENDING_MSG =
  'Payment is pending authorization. Request for authorization from approver.';

/**
 * If error code exists and matches the string, removed the retry button
 * and replaces it with ok button, which closes checkout.
 * @param {Session} session
 * @param {string} message
 */
export function replaceRetryIfCorporateNetbanking(
  session: SessionType,
  message: string
) {
  if (message === AUTH_PENDING_MSG) {
    session.isCorporateBanking = true;

    updateActionAreaContentAndCTA(session, 'OK', undefined, true);
  } else {
    (querySelector('#fd-hide') as HTMLElement).focus();
  }
}
