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
import * as EmiUtils from 'common/emi';
import * as GPay from 'gpay';
import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'templates/paymentMethodIcons';
import * as Confirm from 'confirm';
import Callout from 'callout';
import * as Currency from 'common/currency';
import * as OtpService from 'common/otpservice';
import * as strings from 'common/strings';
import * as UserAgent from 'common/useragent';
import emiView from 'checkoutframe/emi';
import FeeBearerView from 'templates/views/feebearer.svelte';
import emandateView from 'checkoutframe/emandate';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import * as Curtain from 'components/curtain';
import { setShieldParams } from 'payment/validator';
import * as P13n from 'checkoutframe/personalization';
import { commonBanks, getFullBankLogo } from 'common/bank';

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
import * as Downtimes from 'checkoutframe/downtimes';
import * as Payouts from 'checkoutframe/payouts';
import { initIframe } from 'checkoutframe/iframe';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';
import { Formatter } from 'formatter';

import Store from 'checkoutstore';
import PreferencesStore from 'checkoutstore/preferences';
import SessionStore from 'checkoutstore/session';
import DowntimesStore from 'checkoutstore/downtimes';
import * as EmiStore from 'checkoutstore/emi';
import * as OTPScreenStore from 'checkoutstore/screens/otp';
import * as Cta from 'checkoutstore/cta';
import * as HomeScreenStore from 'checkoutstore/screens/home';

import QRScreen from 'templates/views/qr.svelte';
import BankTransferScreen from 'templates/views/bank_transfer.svelte';
import UpiTab from 'templates/tabs/upi/index.svelte';
import emiOptionsView from 'templates/screens/cardlessemi.svelte';
import emiScreenView from 'templates/screens/emiscreen.svelte';
import SavedCardsView from 'templates/screens/savedcards.svelte';
import PayLaterView from 'templates/screens/paylater.svelte';
import HomeTab from 'templates/tabs/home.svelte';
import NetbankingTab from 'templates/tabs/netbanking/index.svelte';
import NachScreen from 'templates/views/nach.svelte';
// import CardTab from 'templates/tabs/card/card.svelte';
import CardTab from 'templates/tabs/card/card2.svelte';

import PayoutsInstruments from 'templates/screens/payout-instruments.svelte';
import PayoutAccount from 'templates/screens/payout-account.svelte';

import * as Hacks from 'checkoutframe/hacks';

import { get as storeGetter } from 'svelte/store';
import * as Experiments from 'experiments';

import * as NBHandlers from 'handlers/netbanking';

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
  EmiUtils,
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
  Downtimes,
  Payouts,

  Store,
  PreferencesStore,
  DowntimesStore,
  SessionStore,
  OTPScreenStore,
  HomeScreenStore,
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
  SavedCardsView,

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
  _,

  NBHandlers,
};
