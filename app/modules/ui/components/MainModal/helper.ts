import { displayCurrencies } from 'common/currency';
import { isIRCTC, getOption } from 'razorpay';
import { AndroidWebView } from 'common/useragent';
import { scrollIntoView } from 'lib/utils';
import { formatAmountWithCurrency } from 'helper/currency';

export function getAmount(): string {
  const amount = getOption('amount');
  const display_amount = getOption('display_amount');
  const display_currency = getOption(
    'display_currency'
  ) as keyof typeof displayCurrencies;

  if (display_amount && display_currency) {
    return displayCurrencies[display_currency] + display_amount;
  } else {
    return formatAmountWithCurrency(amount);
  }
}

/**
 * We want to disable animations on IRCTC WebView.
 * IRCTC disables h/w acceleration on their WebViews
 * which makes our animations stutter.
 *
 * There isn't a reliable way to detect h/w acceleration
 * state in the browser, so we're doing this based on merchants.
 */
export function disableAnimation(): boolean {
  const irctcWebview = AndroidWebView && isIRCTC();
  return irctcWebview || !getOption('modal.animation');
}

export function bringInputIntoView() {
  const el = document.activeElement as HTMLElement;
  if (el?.tagName === 'INPUT') {
    /**
     * When device is rotated or the keyboard is shown,
     * if an input element was focused on,
     * it might get hidden behind the keyboard.
     * Let's bring it into view.
     */
    setTimeout(function () {
      scrollIntoView(el);
    });
  }
}
