import { coupons, couponsList } from 'one_click_checkout/coupons/config';
import details from 'one_click_checkout/common/details/config';
import {
  savedAddress,
  addAddress,
  savedBillingAddress,
  addBillingAddress,
  editAddress,
  editBillingAddress,
} from 'one_click_checkout/address/config';
import otp from 'one_click_checkout/common/otpConfig';
import { screensHistory } from 'one_click_checkout/routing/History';

const routes = [
  { ...coupons },
  { ...couponsList },
  { ...savedAddress },
  { ...addAddress },
  { ...editAddress },
  { ...otp },
  { ...details },
  { ...savedBillingAddress },
  { ...addBillingAddress },
  { ...editBillingAddress },
];

screensHistory.setConfig({ otp });

export default routes;
