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
import { isQRPaymentActive } from 'upi/helper';
import { querySelector } from 'utils/doc';

import {
  triggerTruecallerIntent,
  setCustomer,
  TRUECALLER_VARIANT_NAMES,
  ERRORS,
} from 'truecaller';

import { shouldShowProceedOverlay } from 'truecaller/store';
import type { TruecallerVariantNames } from 'truecaller/types';

import Analytics from 'analytics';
import { META_KEYS } from 'truecaller/analytics/events';

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
      this.get('retry') &&
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
      })
    ) {
      /**
       * If user has chosen app tile from L0 and payment is somehow failed,
       * then we should land the user automatically in l1 with error message as alert in L1
       * note: only switch when retry is enabled
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

/**
 * for UPI QR at L0/L1 active or failed due to checkout order failure
 * it causing issue when we skip OTP as it triggers the submit flow because of payload present
 * @param payload TODO update exact type
 * @returns
 */
export function isPayloadIsOfQR(payload?: Record<string, any> | null) {
  return (
    (isQRPaymentActive() && payload?.['_[upiqr]'] === '1') ||
    payload?.['_[checkout_order]'] === '1'
  );
}

/**
 * Method to add text content to the given HTML element
 * @param {String} text
 */
export function updateSubLinkContent(text: string) {
  const subLink = querySelector('#error-message .link') as HTMLElement;
  if (subLink) {
    subLink.textContent = text;
  }
}

export function initLoginForSavedCard(
  this: Session,
  variant: TruecallerVariantNames
) {
  triggerTruecallerIntent({}, variant)
    .then((data) => {
      Analytics.setMeta(META_KEYS.LOGIN_SCREEN_SOURCE, variant);
      setCustomer(data);

      if (
        variant === TRUECALLER_VARIANT_NAMES.access_saved_cards ||
        variant === TRUECALLER_VARIANT_NAMES.preferred_methods
      ) {
        this.switchTab('card');
        this.setScreen('card');
        if (this.svelteCardTab) {
          (this.svelteCardTab as any).showLandingView();
        }
      }

      if (variant === TRUECALLER_VARIANT_NAMES.add_new_card) {
        shouldShowProceedOverlay.set(true);
        this.submit();
      }
    })
    .catch((error) => {
      if (
        error?.code &&
        ![
          ERRORS.TRUECALLER_LOGIN_DISABLED,
          ERRORS.TRUECALLER_NOT_FOUND,
        ].includes(error.code) &&
        this.otpView
      ) {
        (this.otpView as any).updateScreen({ truecallerLoginFailed: true });
      }

      if (variant === TRUECALLER_VARIANT_NAMES.add_new_card) {
        this.sendOTP();
      } else {
        this.askOTPForSavedCard();
      }
    });
}
