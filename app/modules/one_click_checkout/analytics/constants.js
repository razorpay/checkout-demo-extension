import { views } from 'one_click_checkout/routing/constants';
import { METHODS as METHODSLIST } from 'checkoutframe/constants';

const {
  COUPONS,
  COUPONS_LIST,
  SAVED_ADDRESSES,
  SAVED_BILLING_ADDRESS,
  ADD_ADDRESS,
  ADD_BILLING_ADDRESS,
  METHODS,
  OTP,
  DETAILS,
} = views;

const { UPI, EMI, CARD, WALLET, PAYLATER, EMI_PLANS, NETBANKING } = METHODSLIST;

export const SCREEN_LIST = {
  [COUPONS]: 'summary_screen',
  [COUPONS_LIST]: 'coupon_screen',
  [SAVED_ADDRESSES]: 'saved_shipping_address_screen',
  [SAVED_BILLING_ADDRESS]: 'saved_billing_address_screen',
  [ADD_ADDRESS]: 'new_shipping_address_screen',
  [ADD_BILLING_ADDRESS]: 'new_billing_address_screen',
  [OTP]: 'otp_screen',
  [DETAILS]: 'details_screen',
  [METHODS]: 'payment_l0_screen',
  [UPI]: 'payment_l1_screen',
  [EMI]: 'payment_l1_screen',
  [CARD]: 'payment_l1_screen',
  [WALLET]: 'payment_l1_screen',
  [PAYLATER]: 'payment_l1_screen',
  [EMI_PLANS]: 'payment_l1_screen',
  [NETBANKING]: 'payment_l1_screen',
};
