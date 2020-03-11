import 'entry/checkout-frame';
import {
  makeAuthUrl,
  makePrefParams,
  validateOverrides,
} from 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';

import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as UPIUtils from 'common/upi';
import * as GPay from 'gpay';
import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import * as Confirm from 'confirm';
import Callout from 'callout';
import * as Currency from 'common/currency';
import * as OtpService from 'common/otpservice';
import * as strings from 'common/strings';
import * as UserAgent from 'common/useragent';
import emiView from 'checkoutframe/emi';
import FeeBearerView from 'ui/components/feebearer.svelte';
import emandateView from 'checkoutframe/emandate';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import * as Curtain from 'components/curtain';
import { setShieldParams } from 'payment/validator';
import * as P13n from 'checkoutframe/personalization';
import { commonBanks, getFullBankLogo } from 'common/bank';
import * as CountryCodesUtil from 'common/countrycodesutil';

/* Required for merchant.js migration */
import * as Constants from 'common/constants';
import * as Bank from 'common/bank';
import * as Card from 'common/card';
import * as Wallet from 'common/wallet';
import * as CardlessEmi from 'common/cardlessemi';
import * as PayLater from 'common/paylater';
import * as Token from 'common/token';
import * as SessionManager from 'sessionmanager';
import * as Checkout from 'checkoutframe/index';
import * as Offers from 'checkoutframe/offers';
import * as Flows from 'checkoutframe/flows';
import * as Payouts from 'checkoutframe/payouts';
import { initIframe } from 'checkoutframe/iframe';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';
import { Formatter } from 'formatter';

import * as Store from 'checkoutstore';
import * as MethodStore from 'checkoutstore/methods';
import SessionStore from 'checkoutstore/session';
import * as EmiStore from 'checkoutstore/emi';
import * as OTPScreenStore from 'checkoutstore/screens/otp';
import * as Cta from 'checkoutstore/cta';
import * as HomeScreenStore from 'checkoutstore/screens/home';
import * as CardScreenStore from 'checkoutstore/screens/card';
import * as CustomerStore from 'checkoutstore/customer';

import QRScreen from 'ui/tabs/qr/index.svelte';
import BankTransferScreen from 'ui/tabs/bank-transfer/index.svelte';
import UpiTab from 'ui/tabs/upi/index.svelte';
import emiOptionsView from 'ui/tabs/cardless-emi/index.svelte';
import emiScreenView from 'ui/tabs/emi/emiscreen.svelte';
import PayLaterView from 'ui/tabs/paylater/index.svelte';
import HomeTab from 'ui/tabs/home/index.svelte';
import NetbankingTab from 'ui/tabs/netbanking/index.svelte';
import NachScreen from 'ui/tabs/nach/index.svelte';
import CardTab from 'ui/tabs/card/index.svelte';

import PayoutsInstruments from 'ui/tabs/payout/payout-instruments.svelte';
import PayoutAccount from 'ui/tabs/payout/payout-account.svelte';

import * as Hacks from 'checkoutframe/hacks';

import { get as storeGetter } from 'svelte/store';
import * as Experiments from 'experiments';

import * as NBHandlers from 'handlers/netbanking';
import * as UserHandlers from 'handlers/user';

export default {
  RazorpayConfig,
  makeAuthUrl,
  validateOverrides,
  makePrefParams,
  fetch,
  Track,
  Analytics,
  AnalyticsTypes,
  UPIUtils,
  setShieldParams,
  GPay,
  Color,
  _PaymentMethodIcons,
  Confirm,
  Callout,
  Currency,
  OtpService,
  getDecimalAmount: Currency.getDecimalAmount,
  currencies: Currency.displayCurrencies,
  error: _.rzpError,
  Formatter,

  cancelMsg: strings.cancelMsg,
  confirmCancelMsg: strings.confirmCancelMsg,
  wrongOtpMsg: strings.wrongOtp,

  initIframe,

  Constants,
  Bank,
  Card,
  Wallet,
  CardlessEmi,
  PayLater,
  Token,
  SessionManager,
  Checkout,
  Bridge,
  P13n,
  UserAgent,
  Offers,
  Flows,
  Payouts,
  CountryCodesUtil,

  Store,
  MethodStore,
  SessionStore,
  CustomerStore,
  OTPScreenStore,
  HomeScreenStore,
  CardScreenStore,
  EmiStore,
  Cta,

  getQueryParams: _.getQueryParams,

  Customer,
  getCustomer,
  sanitizeTokens,

  emiView,
  emandateView,
  emiOptionsView,
  emiScreenView,
  emiPlansView,

  FeeBearerView,
  PayoutsInstruments,
  PayoutAccount,

  otpView,
  PayLaterView,
  Curtain,
  commonBanks,
  timer: _.timer,
  QRScreen,
  BankTransferScreen,
  getFullBankLogo,

  HomeTab,
  UpiTab,
  NetbankingTab,
  NachScreen,
  CardTab,

  Hacks,
  storeGetter,
  Experiments,

  _Arr,
  _Doc,
  _El,
  _Func,
  _Obj,
  _Str,
  _,

  NBHandlers,
  UserHandlers,
};
