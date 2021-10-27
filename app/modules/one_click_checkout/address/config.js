import { views } from 'one_click_checkout/routing/constants';
import Address from 'one_click_checkout/address/ui/Address.svelte';
import BillingAddress from 'one_click_checkout/address/billing_address/index.svelte';

import {
  OTP_LABELS as ADDRESS_OTP_LABELS,
  ADD_ADDRESS_OTP_LABELS,
} from 'one_click_checkout/address/constants';

import {
  successHandler as addressOTPSuccessHandler,
  skipOTPHandle as addressOTPSkipHandler,
  addressSaveOTPSuccessHandler,
  addressSaveOTPSkipHandler,
} from 'one_click_checkout/address/helpers';

export const address = {
  name: views.ADDRESS,
  component: Address,
  isBackEnabled: true,
  otpLabels: ADDRESS_OTP_LABELS,
  otpProps: {
    successHandler: addressOTPSuccessHandler,
    skipOTPHandle: addressOTPSkipHandler,
  },
};

export const billingAddress = {
  name: views.BILLING_ADDRESS,
  component: BillingAddress,
  isBackEnabled: true,
  otpLabels: ADDRESS_OTP_LABELS,
  otpProps: {
    successHandler: addressOTPSuccessHandler,
    skipOTPHandle: addressOTPSkipHandler,
  },
};

export const savedAddress = {
  name: views.SAVED_ADDRESSES,
  parent: views.ADDRESS,
  component: Address,
  tabTitle: views.ADDRESS,
  props: { currentView: views.SAVED_ADDRESSES },
  isBackEnabled: true,
};

export const savedBillingAddress = {
  name: views.SAVED_BILLING_ADDRESS,
  parent: views.BILLING_ADDRESS,
  component: BillingAddress,
  tabTitle: views.BILLING_ADDRESS,
  props: { currentView: views.SAVED_BILLING_ADDRESS },
  isBackEnabled: true,
};

export const addAddress = {
  name: views.ADD_ADDRESS,
  parent: views.ADDRESS,
  component: Address,
  tabTitle: views.ADDRESS,
  props: { currentView: views.ADD_ADDRESS },
  isBackEnabled: true,
  otpLabels: ADD_ADDRESS_OTP_LABELS,
  otpProps: {
    successHandler: addressSaveOTPSuccessHandler,
    skipOTPHandle: addressSaveOTPSkipHandler,
  },
};

export const addBillingAddress = {
  name: views.ADD_BILLING_ADDRESS,
  parent: views.BILLING_ADDRESS,
  component: BillingAddress,
  tabTitle: views.BILLING_ADDRESS,
  otpLabels: ADDRESS_OTP_LABELS,
  props: { currentView: views.ADD_BILLING_ADDRESS },
  isBackEnabled: true,
  otpProps: {
    successHandler: addressSaveOTPSuccessHandler,
    skipOTPHandle: addressSaveOTPSkipHandler,
  },
};
