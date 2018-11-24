import 'entry/checkout-frame';
import { RazorpayConfig, makeAuthUrl, makePrefParams } from 'common/Razorpay';

import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as UPIUtils from 'common/upi';
import * as Tez from 'tez';
import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'templates/paymentMethodIcons';
import * as Confirm from 'confirm';
import Callout from 'callout';
import { getDecimalAmount, displayCurrencies } from 'common/currency';
import * as strings from 'common/strings';
import { androidBrowser } from 'common/useragent';
import emiView from 'checkoutframe/emi';
import SavedCardsView from 'checkoutframe/savedcards';
import emandateView from 'checkoutframe/emandate';
import otpView from 'checkoutframe/otp';
import * as Curtain from 'components/curtain';
import * as OptionsList from 'components/OptionsList';
import { setShieldParams } from 'payment/validator';
import { commonBanks } from 'common/bank';

/* Required for merchant.js migration */
import * as Constants from 'common/constants';
import * as Bank from 'common/bank';
import * as Wallet from 'common/wallet';
import * as CardlessEmi from 'common/cardlessemi';
import * as Token from 'common/token';
import * as SessionManager from 'sessionmanager';
import * as Checkout from 'checkoutframe/index';
import { initIframe } from 'checkoutframe/iframe';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';
import Store from 'checkoutframe/store';
import * as StoreHelpers from 'checkoutframe/storehelpers';

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
  Tez,
  Color,
  _PaymentMethodIcons,
  Confirm,
  Callout,
  getDecimalAmount,
  currencies: displayCurrencies,
  androidBrowser,
  error: _.rzpError,
  cancelMsg: strings.cancelMsg,
  wrongOtpMsg: strings.wrongOtp,

  initIframe,

  Constants,
  Bank,
  Wallet,
  CardlessEmi,
  Token,
  SessionManager,
  Checkout,
  Bridge,
  Store,
  StoreHelpers,

  getQueryParams: _.getQueryParams,

  Customer,
  getCustomer,
  sanitizeTokens,

  emiView,
  emandateView,
  SavedCardsView,

  otpView,
  Curtain,
  OptionsList,
  commonBanks,
  timer: _.timer,
};
