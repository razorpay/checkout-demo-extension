import { resetSelectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { getLatestPayment, matchLatestPaymentWith } from 'payment/history';
import { upiUxV1dot1 } from 'upi/experiments';

import { format } from 'i18n';
import type Session from 'session/session';
import { moveControlToSession, pushOverlay } from 'navstack';
import IneleigibleModalSvelte from 'ui/components/IneleigibleModal.svelte';
import { isEmiV2 } from 'razorpay';
import { isCardlessTab } from 'emiV2/helper/tabs';
import { trackDebitCardEligibilityChecked } from 'emiV2/events/tracker';

export function handleErrorModal(this: Session, message: string) {
  if (isEmiV2() && this.tab === 'emi') {
    /** If it's a new emi flow and payment method is emi
     * if the payment for debit emi fails for phone number not being eligible
     * Show the Ineligible modal UI
     * and send the control back to navstack for new emi flow payment errors
     * Currently we are mapping with error code for Debit ineligibilty
     */
    const { statusData } = getLatestPayment();
    if (
      statusData &&
      statusData.error &&
      statusData.error.code === 'BAD_REQUEST_DEBIT_EMI_CUSTOMER_NOT_ELIGIBLE' &&
      (this.screen === 'otp' || this.screen === 'card')
    ) {
      // Track Debit eligibility check failure
      trackDebitCardEligibilityChecked(false);
      pushOverlay({
        component: IneleigibleModalSvelte,
      });
      this.setScreen('card');
      this.hideErrorMessage();
      moveControlToSession(false);
    } else if (
      (statusData?.error?.step === 'payment_eligibility check' ||
        statusData?.error?.reason === 'invalid_mobile_number') &&
      isCardlessTab()
    ) {
      // if cardless eligibility check fails we dont want to show to error popup
      // or if the AJAX call give error because of invalid mobile number
      return;
    } else {
      this.showLoadError(
        message || format('misc.error_handling_request'),
        true
      );
    }
  } else if (upiUxV1dot1.enabled()) {
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
        }) &&
        !matchLatestPaymentWith({
          referrer: 'QR_V2',
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
    if (
      !matchLatestPaymentWith({
        referrer: 'QR_V2',
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
}
