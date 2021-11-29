import {
  getCustomerDetails,
  isUserLoggedIn,
} from 'one_click_checkout/common/helpers/customer';
import otpEvents from 'ui/tabs/otp/analytics';
import { Events } from 'analytics';
import { get } from 'svelte/store';
import * as OtpScreenStore from 'checkoutstore/screens/otp';
import {
  createOTP,
  updateOTPStore,
} from 'one_click_checkout/common/otpHelpers';
import { savedAddresses } from 'one_click_checkout/address/store';
import { views } from 'one_click_checkout/routing/constants';
import { mergeObjOnKey } from 'one_click_checkout/common/utils';
import { OTP_PARAMS } from 'one_click_checkout/common/constants';
import { RESEND_OTP_INTERVAL } from 'one_click_checkout/otp/constants';

const hasSavedAddresses =
  (redirect, check_status = true, reason) =>
  (view, history) => {
    const customer = getCustomerDetails();
    const labels = history.config[view].otpLabels;
    const props = history.config[view].otpProps;

    const loggedIn = isUserLoggedIn();

    if (!loggedIn && !check_status) {
      return redirect;
    }

    if (loggedIn) {
      if (get(savedAddresses).length) {
        return;
      }
      return redirect;
    }

    if (check_status) {
      history.config[views.OTP].props = {
        ...history.config[views.OTP].props,
        ...props,
      };
      history.config[views.OTP].otpParams = {
        loading: {
          templateData: { phone: customer.contact },
          ...mergeObjOnKey(OTP_PARAMS, labels, 'loading'),
        },
        sent: mergeObjOnKey(OTP_PARAMS, labels, 'sent'),
        verifying: mergeObjOnKey(OTP_PARAMS, labels, 'verifying'),
      };

      const sms_hash = customer.r.get('sms_hash');
      const params = { skip_otp: true };
      if (sms_hash) {
        params.sms_hash = sms_hash;
      }

      updateOTPStore({ ...history.config[views.OTP].otpParams.loading });

      customer.checkStatus(
        function () {
          if (customer.saved_address && !customer.logged) {
            Events.Track(otpEvents.OTP_LOAD, {
              otp_skip_visible: get(OtpScreenStore.allowSkip),
              otp_reason: reason,
            });

            createOTP(() => {
              updateOTPStore({
                ...history.config[views.OTP].otpParams.sent,
                resendTimeout: Date.now() + RESEND_OTP_INTERVAL,
                digits: new Array(get(OtpScreenStore.maxlength)),
              });
            });
          } else {
            history.push(redirect);
          }
        },
        params,
        customer.contact
      );
      return views.OTP;
    }
  };

export default hasSavedAddresses;