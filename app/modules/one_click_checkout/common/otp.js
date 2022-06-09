// historyHelpers
import { get } from 'svelte/store';
import * as OtpScreenStore from 'checkoutstore/screens/otp';
import * as HomeScreenStore from 'checkoutstore/screens/home';
import { setSavedAddresses } from 'one_click_checkout/address/sessionInterface';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
import { screensHistory } from 'one_click_checkout/routing/History';
import { views } from 'one_click_checkout/routing/constants';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import { OTP_PARAMS } from 'one_click_checkout/common/constants';
import otpEvents from 'one_click_checkout/otp/analytics';
import { Events, Track } from 'analytics';
import {
  mergeObjOnKey,
  isNumericalString,
} from 'one_click_checkout/common/utils';
import { INVALID_OTP_LABEL } from 'ui/labels/otp';
import {
  OTP_TEMPLATES,
  RESEND_OTP_INTERVAL,
} from 'one_click_checkout/otp/constants';
import { getDefaultOtpTemplate } from 'checkoutframe/sms_template';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import {
  CATEGORIES,
  ACTIONS,
} from 'one_click_checkout/merchant-analytics/constant';
import { submitAttemptIndex } from 'one_click_checkout/otp/store';
import { consentGiven } from 'one_click_checkout/address/store';
import { getDeviceId } from 'fingerprint';

let customer;

/**
 * Leverages routing/config.js to receive and hence, create props and other
 * details based on the 'currentView' in the 1CC flow and uses them to trigger the
 * OTP flow by updating the store and populating the UI with the desired details
 */
export const askForOTP = (otp_reason) => {
  customer = getCustomerDetails();
  const routesConfig = screensHistory.config;
  routesConfig[views.OTP].props = {
    ...routesConfig[views.OTP].props,
    ...navigator.currentActiveRoute.otpProps,
    otpReason: otp_reason,
    smsTemplate: OTP_TEMPLATES[otp_reason],
  };

  routesConfig[views.OTP].otpParams = {
    loading: {
      templateData: { phone: customer.contact },
      ...mergeObjOnKey(
        OTP_PARAMS,
        navigator.currentActiveRoute.otpLabels,
        'loading'
      ),
    },
    sent: mergeObjOnKey(
      OTP_PARAMS,
      navigator.currentActiveRoute.otpLabels,
      'sent'
    ),
    verifying: mergeObjOnKey(
      OTP_PARAMS,
      navigator.currentActiveRoute.otpLabels,
      'verifying'
    ),
  };
  const otpParams = routesConfig[views.OTP].otpParams;
  navigator.navigateTo({
    path: views.OTP,
    props: routesConfig[views.OTP].props,
  });

  updateOTPStore(otpParams.loading);
  Events.TrackRender(otpEvents.OTP_LOAD, {
    is_otp_skip_cta_visibile: get(OtpScreenStore.allowSkip),
    otp_reason,
  });
  createOTP(() => {
    updateOTPStore({
      ...otpParams.sent,
      digits: new Array(6),
      allowSkip: true,
    });
  });
};

/**
 * Callback that is triggered after the submitOTP API call is completed
 * @param {string} msg error occured while OTP submission via the network
 * @param {object} data response data from the submit OTP API call
 */
const postSubmit = (msg, data) => {
  const routesConfig = screensHistory.config;
  const otpParams = routesConfig[views.OTP].otpParams;
  updateOTPStore({ loading: false });
  if (msg) {
    merchantAnalytics({
      event: ACTIONS.LOGIN_FAILED,
      category: CATEGORIES.LOGIN,
    });
    updateOTPStore({ errorMessage: msg, ...otpParams.sent });
  } else {
    merchantAnalytics({
      event: ACTIONS.LOGIN_SUCCESS,
      category: CATEGORIES.LOGIN,
    });
    if (data && data.addresses) {
      setSavedAddresses(data.addresses);
    }
    updateOTPStore({ renderCtaOneCC: false });
    screensHistory.config.otp.props.successHandler(data);
  }
};

/**
 * Method used for pre-submit otp input validation
 * @param {string} otpStr the joined otp string
 * @returns Boolean whether entered otp is valid or not
 */
const isValidOtp = (otpStr) => {
  if (
    otpStr.length !== get(OtpScreenStore.maxlength) ||
    !isNumericalString(otpStr)
  ) {
    return false;
  }
  return true;
};

/**
 * Validates the input and hence, submits the OTP
 */
export const submitOTP = () => {
  const routesConfig = screensHistory.config;
  const customer = getCustomerDetails();

  const { verifying } = routesConfig[views.OTP].otpParams;
  const { otpReason } = routesConfig[views.OTP].props;
  const otp = get(OtpScreenStore.otp) || get(OtpScreenStore.digits).join('');
  if (!isValidOtp(otp)) {
    updateOTPStore({ errorMessage: INVALID_OTP_LABEL });
    return;
  }
  updateOTPStore({ errorMessage: '' });
  const submitPayload = {
    otp: otp,
    email: get(HomeScreenStore.email),
  };

  updateOTPStore(verifying);
  if (get(consentGiven)) {
    submitPayload.address_consent = {
      unique_id: Track.makeUid(),
      device_id: getDeviceId(),
    };
  }
  customer.submitOTP(submitPayload, postSubmit);
  submitAttemptIndex.set(get(submitAttemptIndex) + 1);
  Events.TrackBehav(otpEvents.OTP_SUBMIT_CLICK, {
    otp_reason: otpReason,
    submit_attempt_index: get(submitAttemptIndex),
  });
};

/**
 * Method to reset otp store if user goes back in the flow
 */
export const handleBack = () => {
  const routesConfig = screensHistory.config;
  const { otpReason } = routesConfig[views.OTP].props;
  Events.TrackBehav(otpEvents.OTP_BACK_CLICK, { otp_reason: otpReason });
  updateOTPStore({
    mode: '',
    resendTimeout: null,
    ipAddress: '',
    accessTime: '',
    errorMessage: '',
    otp: '',
    digits: new Array(get(OtpScreenStore.maxlength)),
  });
};

/**
 * Method to update the otp store
 * @param {Object} props object taking key which are otp store variables and corresponding desired values
 */
const updateOTPStore = (props) => {
  // TODO: Remove CFU usage
  _Obj.loop(props, (val, prop) => {
    if (OtpScreenStore[prop]) {
      OtpScreenStore[prop].set(val);
    }
  });
};

export const resendOTPHandle = () => {
  const routesConfig = screensHistory.config;
  updateOTPStore({
    textView: 'resending_otp',
    errorMessage: '',
    digits: new Array(6),
    showInput: false,
    headingText: 'none',
    loading: true,
  });
  createOTP(function () {
    updateOTPStore(routesConfig[views.OTP].otpParams.sent);
  });
};

export const createOTP = (
  cb,
  resendTimeout = Date.now() + RESEND_OTP_INTERVAL
) => {
  const customer = getCustomerDetails();
  const otp_reason = getDefaultOtpTemplate();

  customer.createOTP(
    (data) => {
      updateOTPStore({
        resendTimeout,
      });
      cb(data);
    },
    null,
    otp_reason
  );
};
