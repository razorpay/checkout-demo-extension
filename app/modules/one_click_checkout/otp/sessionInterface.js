import { getSession } from 'sessionmanager';
import { resendTimeout } from 'checkoutstore/screens/otp';
import { getThemeMeta } from 'checkoutstore/theme';

export function isWalletPayment() {
  const session = getSession();
  return session.payload && session.payload.method === 'wallet';
}

export function isHeadless() {
  const session = getSession();
  return session.headless;
}

export function stopResendCountdown() {
  // Disable countdown features for non-address flows
  const session = getSession();
  if (session.tab !== 'address') {
    return;
  }
  resendTimeout.set(0);
}

export function startResendCountdown() {
  // Disable countdown features for non-address flows
  const session = getSession();
  if (session.tab !== 'address') {
    return;
  }
  resendTimeout.set(Date.now() + 30 * 1000);
}

export function getTheme() {
  const themeMeta = getThemeMeta();
  return themeMeta;
}
