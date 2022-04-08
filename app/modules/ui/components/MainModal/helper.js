import { displayCurrencies } from 'common/currency';
import { isIRCTC, getOption } from 'razorpay';
import { getSession } from 'sessionmanager';
import { internetExplorer, AndroidWebView } from 'common/useragent';

export function getAmount() {
  const amount = getOption('amount');
  const display_amount = getOption('display_amount');
  const display_currency = getOption('display_currency');

  if (display_amount && display_currency) {
    return displayCurrencies[display_currency] + display_amount;
  } else {
    return getSession().formatAmountWithCurrency(amount);
  }
}

export function getBrandImage() {
  const brandImage = getOption('theme.branding');
  if (brandImage === 'payzapp') {
    return 'https://cdn.razorpay.com/brand/payzapp.png';
  }
  return brandImage;
}

/**
 * We want to disable animations on IRCTC WebView.
 * IRCTC disables h/w acceleration on their WebViews
 * which makes our animations stutter.
 *
 * There isn't a reliable way to detect h/w acceleration
 * state in the browser, so we're doing this based on merchants.
 */
export function disableAnimation() {
  const irctcWebview = AndroidWebView || isIRCTC();
  return internetExplorer || irctcWebview || !getOption('modal.animation');
}
