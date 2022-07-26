import { getPreparedUrl } from 'lib/utils';
import { getOption, getPreferences } from 'razorpay';
import { get } from 'svelte/store';
import { QR_IMAGE_DEFAULT_SIZE } from 'upi/constants';
import { clearPaymentRequest } from 'upi/payment';
import { qrState, resetQRState } from 'upi/ui/components/QR/store';
import { PAYMENT_CANCEL_REASONS } from 'common/constants';
import { appliedOffer } from 'offers/store';

/**
 * Why this method?
 * By default we show a smudged QR
 * Depending on the data/characters involved, google chart apis will provide
 * QR image with required padding automatically for reader compatibility.
 * Hence if smudged QR and Real QR will have a different margins, creating a flashy change in UI
 * Product doesn't want such behavior and we need nearly identical placeholder.
 * @returns string url for QR as close to as real payment
 */
function getQRPaymentTestUrlForImage() {
  return getPreparedUrl('upi://pay', {
    pa: 'razorpay.pg@hdfcbank',
    pn: 'Razorpay',
    tr: 'M10rKVfkNww2eBE',
    am: (
      parseInt(getOption('amount') || getPreferences('order.amount') || 10000) /
      100
    ).toString(),
    cu: 'INR',
    mc: '5411',
    tn: `${getPreferences('merchant_name', '')}${
      getOption('description') || ''
    }`.replace(/ /g, ''),
  });
}

/**
 * https://developers.google.com/chart/infographics/docs/qr_codes
 */

export function getQRImage(url?: string, imageSize?: number) {
  /**
   * When url is empty, it means we have to return a dummy relatively similar image hence use const
   */
  const encodedData = encodeURIComponent(url || getQRPaymentTestUrlForImage());
  const size = imageSize || QR_IMAGE_DEFAULT_SIZE;

  const searchParams = {
    /** Chart Size */
    chs: `${size}x${size}`,
    /** Chart Type */
    cht: 'qr',
    /** Chart Data */
    chl: encodedData,
    /** Chart Encoding */
    choe: 'UTF-8',
    /** Chart <error_correction_level>|<margin> */
    chld: 'L|0',
  };
  return getPreparedUrl('https://chart.googleapis.com/chart', searchParams);
}

export function isQRPaymentActive() {
  return Boolean(get(qrState).url);
}
enum QRPaymentCancelStatus {
  ACTIVE_BUT_FAILED_TO_CANCEL = 0,
  NO_ACTIVE_PAYMENT = 1,
  ACTIVE_BUT_AUTO_CANCELLED = 2,
  ACTIVE_CANCEL_POSSIBLE_WITH_REASON = 3,
}

export function isQRPaymentCancellable(
  metaProps: { '_[reason]'?: string },
  autoCancelIfAny?: boolean,
  cancelSilent?: boolean
) {
  const activeQRPayment = isQRPaymentActive();
  if (!activeQRPayment) {
    return QRPaymentCancelStatus.NO_ACTIVE_PAYMENT;
  }
  if (activeQRPayment && autoCancelIfAny) {
    clearActiveQRPayment(false, cancelSilent);
    return QRPaymentCancelStatus.ACTIVE_BUT_AUTO_CANCELLED;
  }
  if (
    activeQRPayment &&
    metaProps &&
    [
      PAYMENT_CANCEL_REASONS.UNINTENDED_OPT_OUT,
      PAYMENT_CANCEL_REASONS.INTENDED_OPT_OUT,
    ].includes(metaProps['_[reason]'] as string)
  ) {
    return QRPaymentCancelStatus.ACTIVE_CANCEL_POSSIBLE_WITH_REASON;
  }

  return QRPaymentCancelStatus.ACTIVE_BUT_FAILED_TO_CANCEL;
}

export function clearActiveQRPayment(expired = false, silent = false) {
  if (!isQRPaymentActive()) {
    return;
  }
  let reason = '';
  if (expired) {
    reason = get(qrState).manualRefresh
      ? PAYMENT_CANCEL_REASONS.INTENDED_EXPIRE
      : PAYMENT_CANCEL_REASONS.UNINTENDED_EXPIRE;
  } else {
    reason = get(qrState).manualRefresh
      ? PAYMENT_CANCEL_REASONS.INTENDED_OPT_OUT
      : PAYMENT_CANCEL_REASONS.UNINTENDED_OPT_OUT;
  }
  resetQRState();
  clearPaymentRequest(reason, silent);
}

appliedOffer.subscribe((offer) => {
  // clear QR payment after offer apply or removed
  setTimeout(() => {
    if (!offer || (offer && offer.payment_method === 'upi')) {
      isQRPaymentCancellable({}, true, true);
    }
  });
});
