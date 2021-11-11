// historyHelpers
import { get } from 'svelte/store';
import * as OtpScreenStore from 'checkoutstore/screens/otp';
import * as HomeScreenStore from 'checkoutstore/screens/home';
import { savedAddresses } from 'one_click_checkout/address/store';
import { currentView } from 'one_click_checkout/routing/store';
import { screensHistory } from 'one_click_checkout/routing/History';
import { views } from 'one_click_checkout/routing/constants';
import { routesConfig } from 'one_click_checkout/routing/config';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import { OTP_PARAMS } from 'one_click_checkout/common/constants';
import otpEvents from 'ui/tabs/otp/analytics';
import { Events } from 'analytics';
import {
  mergeObjOnKey,
  isNumericalString,
} from 'one_click_checkout/common/utils';
import { INVALID_OTP_LABEL } from 'ui/labels/otp';

let customer;

/**
 * Leverages routing/config.js to receive and hence, create props and other
 * details based on the 'currentView' in the 1CC flow and uses them to trigger the
 * OTP flow by updating the store and populating the UI with the desired details
 */
export const askForOTP = (otp_reason) => {
  customer = getCustomerDetails();
  routesConfig[views.OTP] = {
    ...routesConfig[views.OTP],
    props: {
      ...routesConfig[views.OTP].props,
      ...routesConfig[get(currentView)].otpProps,
    },
    otpParams: {
      loading: {
        templateData: { phone: customer.contact },
        ...mergeObjOnKey(
          OTP_PARAMS,
          routesConfig[get(currentView)].otpLabels,
          'loading'
        ),
      },
      sent: mergeObjOnKey(
        OTP_PARAMS,
        routesConfig[get(currentView)].otpLabels,
        'sent'
      ),
      verifying: mergeObjOnKey(
        OTP_PARAMS,
        routesConfig[get(currentView)].otpLabels,
        'verifying'
      ),
    },
  };
  const otpParams = routesConfig[views.OTP].otpParams;
  const currentScreen = get(currentView);
  screensHistory.push(views.OTP);

  updateOTPStore(otpParams.loading);
  if (currentScreen !== views.ADDRESS) {
    Events.Track(otpEvents.OTP_LOAD, {
      otp_skip_visible: get(OtpScreenStore.allowSkip),
      otp_reason,
    });
    createOTP(() => {
      updateOTPStore({
        ...otpParams.sent,
        digits: new Array(get(OtpScreenStore.maxlength)),
      });
    });
  } else {
    // TODO: don't call if already have the status
    const sms_hash = customer.r.get('sms_hash');
    const params = { skip_otp: true };
    if (sms_hash) {
      params.sms_hash = sms_hash;
    }
    customer.checkStatus(
      function () {
        if (customer.saved_address && !customer.logged) {
          Events.Track(otpEvents.OTP_LOAD, {
            otp_skip_visible: get(OtpScreenStore.allowSkip),
            otp_reason,
          });

          createOTP(() => {
            updateOTPStore({
              ...otpParams.sent,
              resendTimeout: Date.now() + 30 * 1000,
              digits: new Array(get(OtpScreenStore.maxlength)),
            });
          });
        } else {
          screensHistory.replace(views.ADD_ADDRESS);
        }
      },
      params,
      customer.contact
    );
  }
};

/**
 * Callback that is triggered after the submitOTP API call is completed
 * @param {string} msg error occured while OTP submission via the network
 * @param {object} data response data from the submit OTP API call
 */
const postSubmit = (msg, data) => {
  const otpParams = routesConfig[views.OTP].otpParams;
  updateOTPStore({ loading: false });
  if (msg) {
    updateOTPStore({ errorMessage: msg, ...otpParams.sent });
  } else {
    if (data && data.addresses) {
      savedAddresses.set(data.addresses);
    }
    routesConfig[get(currentView)].props.successHandler(data);
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
  )
    return false;
  return true;
};

/**
 * Validates the input and hence, submits the OTP
 */
export const submitOTP = () => {
  const { verifying } = routesConfig[views.OTP].otpParams;
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
  customer.submitOTP(submitPayload, postSubmit);
  Events.TrackBehav(otpEvents.OTP_SUBMIT_CLICK);
};

/**
 * Method to reset otp store if user goes back in the flow
 */
export const handleBack = () => {
  Events.TrackBehav(otpEvents.OTP_BACK_CLICK);
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

export const createOTP = (cb, resendTimeout = Date.now() + 30 * 1000) => {
  customer.createOTP((data) => {
    updateOTPStore({
      resendTimeout,
    });
    cb(data);
  });
};
