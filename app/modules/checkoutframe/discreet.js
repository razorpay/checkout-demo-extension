import 'entry/checkout-frame';
import { RazorpayConfig, makeAuthUrl, makePrefParams } from 'common/Razorpay';

import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as UPIUtils from 'common/upi';
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
import FeeBearerView from 'checkoutframe/feebearer';
import SavedCardsView from 'checkoutframe/savedcards';
import emandateView from 'checkoutframe/emandate';
import emiOptionsView from 'checkoutframe/emioptions';
import emiScreenView from 'checkoutframe/emiscreen';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import * as Curtain from 'components/curtain';
import * as OptionsList from 'components/OptionsList';
import { setShieldParams } from 'payment/validator';
import * as P13n from 'checkoutframe/personalization';
import MethodsList from 'components/MethodsList';
import * as WalletUtils from 'common/wallet';
import { commonBanks, getFullBankLogo } from 'common/bank';

/* Required for merchant.js migration */
import * as Constants from 'common/constants';
import * as Bank from 'common/bank';
import * as Card from 'common/card';
import * as Wallet from 'common/wallet';
import * as CardlessEmi from 'common/cardlessemi';
import * as Token from 'common/token';
import * as SessionManager from 'sessionmanager';
import * as Checkout from 'checkoutframe/index';
import * as Offers from 'checkoutframe/offers';
import * as Flows from 'checkoutframe/flows';
import * as Downtimes from 'checkoutframe/downtimes';
import { initIframe } from 'checkoutframe/iframe';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';

import Store from 'checkoutstore';
import PreferencesStore from 'checkoutstore/preferences.js';
import SessionStore from 'checkoutstore/session.js';

import QRScreen from 'templates/views/qr.svelte';
import MagicView from 'checkoutframe/magic';
import UpiTab from 'templates/tabs/upi/index.svelte';

export default {
  RazorpayConfig,
  makeAuthUrl,
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

  cancelMsg: strings.cancelMsg,
  confirmCancelMsg: strings.confirmCancelMsg,
  wrongOtpMsg: strings.wrongOtp,

  initIframe,

  Constants,
  Bank,
  Card,
  Wallet,
  CardlessEmi,
  Token,
  SessionManager,
  Checkout,
  Bridge,
  P13n,
  MethodsList,
  UserAgent,
  Offers,
  Flows,
  Downtimes,

  Store,
  PreferencesStore,
  SessionStore,

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

  otpView,
  Curtain,
  OptionsList,
  commonBanks,
  timer: _.timer,
  QRScreen,
  getFullBankLogo,

  MagicView,
  UpiTab,

  _Arr,
  _Obj,
  _Func,
  _,
};
