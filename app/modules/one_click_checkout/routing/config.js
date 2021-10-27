import coupons from 'one_click_checkout/coupons/config';
import details from 'one_click_checkout/common/details/config';
import {
  address,
  savedAddress,
  addAddress,
  billingAddress,
  savedBillingAddress,
  addBillingAddress,
} from 'one_click_checkout/address/config';
import otp from 'one_click_checkout/common/otpConfig';
export const routesConfig = {
  coupons,
  address,
  savedAddress,
  addAddress,
  otp,
  details,
  billingAddress,
  savedBillingAddress,
  addBillingAddress,
};
