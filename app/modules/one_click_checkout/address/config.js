import { views } from 'one_click_checkout/routing/constants';
import Address from 'one_click_checkout/address/ui/Address.svelte';
import BillingAddress from 'one_click_checkout/address/billing_address/index.svelte';

import {
  OTP_LABELS as ADDRESS_OTP_LABELS,
  ADD_ADDRESS_OTP_LABELS,
  MANDATORY_OTP_LABELS,
} from 'one_click_checkout/address/constants';
import { ADDRESS_LABEL } from 'one_click_checkout/topbar/i18n/label';

import {
  successHandler as addressOTPSuccessHandler,
  skipOTPHandle as addressOTPSkipHandler,
  addressSaveOTPSuccessHandler,
  addressSaveOTPSkipHandler,
  mandatoryLoginSuccessHandler,
} from 'one_click_checkout/address/helpers';

export const savedAddress = {
  name: views.SAVED_ADDRESSES,
  parent: views.ADDRESS,
  component: Address,
  tabTitle: views.ADDRESS,
  props: { currentView: views.SAVED_ADDRESSES },
  isBackEnabled: true,
  otpLabels: ADDRESS_OTP_LABELS,
  otpProps: {
    successHandler: addressOTPSuccessHandler,
    skipOTPHandle: addressOTPSkipHandler,
  },
  breadcrumHighlight: ADDRESS_LABEL,
};

export const mandatoryLoginOTPOverrides = {
  otpLabels: MANDATORY_OTP_LABELS,
  otpProps: {
    successHandler: mandatoryLoginSuccessHandler,
  },
};

export const savedBillingAddress = {
  name: views.SAVED_BILLING_ADDRESS,
  parent: views.BILLING_ADDRESS,
  component: BillingAddress,
  tabTitle: views.BILLING_ADDRESS,
  props: { currentView: views.SAVED_BILLING_ADDRESS },
  isBackEnabled: true,
  breadcrumHighlight: ADDRESS_LABEL,
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
  breadcrumHighlight: ADDRESS_LABEL,
};

export const addBillingAddress = {
  name: views.ADD_BILLING_ADDRESS,
  parent: views.BILLING_ADDRESS,
  component: BillingAddress,
  tabTitle: views.BILLING_ADDRESS,
  otpLabels: ADD_ADDRESS_OTP_LABELS,
  props: { currentView: views.ADD_BILLING_ADDRESS },
  isBackEnabled: true,
  otpProps: {
    successHandler: addressSaveOTPSuccessHandler,
    skipOTPHandle: addressSaveOTPSkipHandler,
  },
  breadcrumHighlight: ADDRESS_LABEL,
};

export const editAddress = {
  name: views.EDIT_ADDRESS,
  parent: views.ADDRESS,
  component: Address,
  tabTitle: views.ADDRESS,
  props: { currentView: views.EDIT_ADDRESS },
  isBackEnabled: true,
  breadcrumHighlight: ADDRESS_LABEL,
};

export const editBillingAddress = {
  name: views.EDIT_BILLING_ADDRESS,
  parent: views.BILLING_ADDRESS,
  component: BillingAddress,
  tabTitle: views.BILLING_ADDRESS,
  props: { currentView: views.EDIT_BILLING_ADDRESS },
  isBackEnabled: true,
  breadcrumHighlight: ADDRESS_LABEL,
};
