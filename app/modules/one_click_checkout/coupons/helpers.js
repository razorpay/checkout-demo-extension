// UI imports
import Details from 'one_click_checkout/coupons/ui/components/Details.svelte';

// svelte imports
import { get } from 'svelte/store';

// session imports
import { applyCoupon } from 'one_click_checkout/coupons/sessionInterface';

// Analytics imports
import Analytics, { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import {
  CATEGORIES,
  ACTIONS,
} from 'one_click_checkout/merchant-analytics/constant';
import otpEvents from 'otp/analytics';
import GiftCardEvents from 'one_click_checkout/gift_card/analytics';

// i18n imports
import { formatTemplateWithLocale } from 'i18n';
import { locale } from 'svelte-i18n';
import { COUPON_TOAST_MESSAGE } from 'one_click_checkout/coupons/i18n/labels';

// service imports
import { getCoupons } from 'one_click_checkout/coupons/service';

// store imports
import {
  availableCoupons,
  couponInputValue,
  errorCode,
  couponInputSource,
  couponAppliedIndex,
} from 'one_click_checkout/coupons/store';
import { cartDiscount, resetCharges } from 'one_click_checkout/charges/store';
import { getRoute } from 'one_click_checkout/routing/store';
import {
  showBanner,
  consentViewCount,
  consentGiven,
} from 'one_click_checkout/address/store';
import * as OtpScreenStore from 'checkoutstore/screens/otp';
import { shouldShowCoupons } from 'one_click_checkout/store';
import { appliedGiftCards } from 'one_click_checkout/gift_card/store';

// utils imports
import {
  getCurrency,
  isMandatoryLoginEnabled,
  enabledRestrictCoupon,
  isEnableAutoFetchCoupons,
  scriptCouponApplied,
  getPrefilledCouponCode,
} from 'razorpay';
import { screensHistory as history } from 'one_click_checkout/routing/History';
import { mergeObjOnKey } from 'one_click_checkout/common/utils';
import {
  createOTP,
  updateOTPStore,
} from 'one_click_checkout/common/otpHelpers';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
import {
  showToastAfterDelay,
  TOAST_THEME,
  TOAST_SCREEN,
} from 'one_click_checkout/Toast';
import { formatAmountWithSymbol } from 'common/currency';
import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';
import { pushOverlay } from 'navstack';
import { showAddressConsentModal } from 'one_click_checkout/address/consent';
import { resetAddresses } from 'one_click_checkout/address/derived';
import { removeGCAnalytics } from 'one_click_checkout/gift_card/helpers';

// constant imports
import { RESEND_OTP_INTERVAL, OTP_TEMPLATES, otpReasons } from 'otp/constants';
import { OTP_PARAMS } from 'one_click_checkout/common/constants';
import { ERROR_USER_NOT_LOGGED_IN } from 'one_click_checkout/coupons/constants';
import { views } from 'one_click_checkout/routing/constants';
import { showLoader } from 'one_click_checkout/loader/store';
import { mandatoryLoginOTPOverrides } from 'one_click_checkout/address/config';
import { COUPON_GC_SOURCE } from 'one_click_checkout/gift_card/constants';

export function nextView() {
  const { DETAILS, ADDRESS } = views;
  const [isContactValid, isEmailValid] = validateEmailAndContact();
  if (!isContactValid || !isEmailValid) {
    return DETAILS;
  }
  return ADDRESS;
}

export function fetchCoupons() {
  if (
    !shouldShowCoupons() ||
    !isEnableAutoFetchCoupons() ||
    scriptCouponApplied()
  ) {
    return;
  }

  return getCoupons()
    .then((coupons) => {
      // Avoid updating state if there are not coupons.
      if (!coupons.length) {
        return;
      }
      availableCoupons.set(coupons);
    })
    .catch((e) => {
      Events.TrackMetric(CouponEvents.COUPONS_FETCH_FAILED, {
        failure_reason: e?.error?.reason,
      });
    })
    .finally(() => {
      const countOfCoupons = getAvailableCouponsLength();
      Analytics.setMeta(MetaProperties.AVAILABLE_COUPONS_COUNT, countOfCoupons);
      Events.TrackRender(CouponEvents.COUPONS_SCREEN, {
        coupons_count: countOfCoupons,
      });
      Events.TrackRender(CouponEvents.SUMMARY_COUPONS_COUNT, {
        count_coupons_available: countOfCoupons,
      });
    });
}

/**
 * Calls backend to verify if coupon code is valid.
 * @param {string} code The coupon code enetered/selected by the user
 */
export function applyCouponCode(code, couponSource = '') {
  if (scriptCouponApplied()) {
    // to handle prefilled coupon case and such
    return;
  }
  const source = code ? 'merchant' : 'manual';
  const input = code || get(couponInputValue);

  couponInputSource.set(couponSource ?? source);
  couponAppliedIndex.set(get(couponAppliedIndex) + 1);

  if (input) {
    applyCoupon(input, couponSource ?? source, {
      onValid: () => {
        if (enabledRestrictCoupon() && get(appliedGiftCards)?.length) {
          const selectedGiftCards = get(appliedGiftCards)?.map(
            ({ giftCardNumber }) => giftCardNumber
          );
          removeGCAnalytics({
            event: GiftCardEvents.GC_REMOVED,
            selectedGiftCards,
            rmvSource: COUPON_GC_SOURCE,
          });
          appliedGiftCards.set([]);
        }
        Analytics.setMeta('is_coupon_valid', true);
        Analytics.setMeta('coupon_code', input);
        merchantAnalytics({
          event: ACTIONS.COUPONS_APPLIED_SUCCESS,
          category: CATEGORIES.COUPONS,
          params: {
            page_title: CATEGORIES.COUPONS,
            coupon_code: input,
          },
        });
        Events.TrackMetric(CouponEvents.COUPON_VALIDATION_COMPLETED, {
          is_coupon_valid: true,
          code: input,
          source: couponSource ?? source,
        });
        navigator.navigateTo({ path: views.COUPONS });
        showToastAfterDelay(
          {
            delay: 5000,
            message: formatTemplateWithLocale(
              COUPON_TOAST_MESSAGE,
              {
                amount: formatAmountWithSymbol(
                  get(cartDiscount),
                  getCurrency(),
                  false
                ),
              },
              get(locale)
            ),
            theme: TOAST_THEME.SUCCESS,
            screen: TOAST_SCREEN.ONE_CC,
          },
          150
        );
      },
      onInvalid: (error) => {
        Analytics.setMeta('is_coupon_valid', false);
        Analytics.setMeta('coupon_code', input);
        merchantAnalytics({
          event: ACTIONS.COUPONS_APPLIED_FAILED,
          category: CATEGORIES.COUPONS,
          params: {
            page_title: CATEGORIES.COUPONS,
            coupon_code: input,
          },
        });
        Events.TrackMetric(CouponEvents.COUPON_VALIDATION_COMPLETED, {
          is_coupon_valid: false,
          error_reason: error?.error?.reason,
          error_description: error?.error?.description,
        });
        if (error?.failure_code === ERROR_USER_NOT_LOGGED_IN) {
          pushOverlay({
            component: Details,
          });
          errorCode.set(error.failure_code);
        }
      },
    });
  }
}

export function successHandler() {
  applyCouponCode();
  navigator.replace(views.COUPONS);
}

export function skipCouponOTP() {
  navigator.replace(views.COUPONS);
}

export function skipCouponListOTP() {
  navigator.replace(views.COUPONS_LIST);
}

export function handleCreateOTP() {
  const customer = getCustomerDetails();
  const isMandatoryLogin = isMandatoryLoginEnabled();
  const template = isMandatoryLogin
    ? OTP_TEMPLATES.mandatory_login
    : OTP_TEMPLATES.access_address;
  const { otpLabels, otpProps } = isMandatoryLogin
    ? mandatoryLoginOTPOverrides
    : getRoute(views.SAVED_ADDRESSES);

  history.config[views.OTP].props = {
    ...history.config[views.OTP].props,
    ...otpProps,
    otpReason: template,
  };
  history.config[views.OTP].otpParams = {
    loading: {
      templateData: { phone: customer.contact },
      ...mergeObjOnKey(OTP_PARAMS, otpLabels, 'loading'),
    },
    sent: mergeObjOnKey(OTP_PARAMS, otpLabels, 'sent'),
    verifying: mergeObjOnKey(OTP_PARAMS, otpLabels, 'verifying'),
  };

  updateOTPStore({ ...history.config[views.OTP].otpParams.loading });
  Events.TrackRender(otpEvents.OTP_LOAD, {
    is_otp_skip_cta_visibile: get(OtpScreenStore.allowSkip),
    otp_reason: isMandatoryLogin
      ? otpReasons.mandatory_login
      : otpReasons.access_address,
  });
  createOTP(
    () => {
      updateOTPStore({
        ...history.config[views.OTP]?.otpParams?.sent,
        resendTimeout: Date.now() + RESEND_OTP_INTERVAL,
        digits: new Array(6),
        allowSkip: !isMandatoryLogin,
      });
    },
    null,
    template
  );
  navigator.navigateTo({
    path: views.OTP,
    props: history.config[views.OTP].props,
  });
}

export function handleAddrConsentSubmit() {
  if (get(consentGiven) || isMandatoryLoginEnabled()) {
    handleCreateOTP();
  } else {
    navigator.navigateTo({ path: views.ADD_ADDRESS });
  }
}

export function onSubmitLogoutUser() {
  const customer = getCustomerDetails();
  const sms_hash = customer.r.get('sms_hash');
  const params = { skip_otp: true };
  resetCharges();
  resetAddresses();
  if (sms_hash) {
    params.sms_hash = sms_hash;
  }

  showLoader.set(true);
  customer.checkStatus(
    function (customerData) {
      consentViewCount.set(customerData['1cc_consent_banner_views'] || 0);
      showLoader.set(false);
      if (customer.saved_address) {
        handleCreateOTP();
      } else if (get(showBanner)) {
        showAddressConsentModal({ onSubmit: handleAddrConsentSubmit });
      } else {
        if (isMandatoryLoginEnabled()) {
          handleCreateOTP();
        } else {
          navigator.navigateTo({ path: views.ADD_ADDRESS });
        }
      }
    },
    params,
    customer.contact
  );
}

export function applyPrefilledCoupon() {
  if (getPrefilledCouponCode()) {
    applyCouponCode(getPrefilledCouponCode(), 'auto');
  }
}

function getAvailableCouponsLength() {
  return getPrefilledCouponCode()
    ? get(availableCoupons).length + 1
    : get(availableCoupons).length;
}
