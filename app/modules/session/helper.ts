import { resetSelectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { matchLatestPaymentWith } from 'payment/history';
import { upiUxV1dot1 } from 'upi/experiments';

import { format } from 'i18n';
import type Session from 'session/session';

export function handleErrorModal(this: Session, message: string) {
  if (upiUxV1dot1.enabled()) {
    if (
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
      })
    ) {
      resetSelectedUPIAppForPay();
    }
    if (
      !this.tab &&
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
      })
    ) {
      /**
       * If user has chosen app tile from L0 and payment is somehow failed,
       * then we should land the user automatically in l1 with error message as alert in L1
       */
      this.switchTab('upi');
      this.hideErrorMessage();
    } else {
      /**
       * As per the new product requirement,
       * if the payment referer is UPI UX and is cancelled by user in any way,
       * We should not show any additional half modals.
       * (in checkout cancelled payment also marked as error at the end, hence we created a history instance
       * that maintained the full details about the payment)
       */
      if (
        !matchLatestPaymentWith({
          referrer: 'UPI_UX',
          inStatuses: ['cancel', 'error'],
          errorReason: 'manual',
        })
      ) {
        this.showLoadError(
          message || format('misc.error_handling_request'),
          true
        );
      }
    }
  } else {
    this.showLoadError(message || format('misc.error_handling_request'), true);
  }
}
