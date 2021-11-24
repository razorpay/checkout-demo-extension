import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import * as OtpScreenStore from 'checkoutstore/screens/otp';

/**
 * Method to update the otp store
 * @param {Object} props object taking key which are otp store variables and corresponding desired values
 */
export const updateOTPStore = (props) => {
  Object.keys(props).map((key) => {
    if (OtpScreenStore[key]) {
      OtpScreenStore[key].set(props[key]);
    }
  });
};

export const createOTP = (cb, resendTimeout = Date.now() + 30 * 1000) => {
  const customer = getCustomerDetails();

  customer.createOTP((data) => {
    updateOTPStore({
      resendTimeout,
    });
    cb(data);
  });
};
