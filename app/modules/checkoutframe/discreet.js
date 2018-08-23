import 'entry/checkout-frame';
import { RazorpayConfig, makeAuthUrl, makePrefParams } from 'common/Razorpay';

import Track from 'tracker';
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
import emandateView from 'checkoutframe/emandate';
import * as Curtain from 'components/curtain';
import { setShieldParams } from 'payment/validator';

/* Required for merchant.js migration */
import * as Constants from 'common/constants';
import * as Bank from 'common/bank';
import * as Wallet from 'common/wallet';
import * as SessionManager from 'sessionmanager';
import * as Checkout from 'checkoutframe/index';
import { initIframe } from 'checkoutframe/iframe';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';

initIframe();

export default {
  RazorpayConfig,
  makeAuthUrl,
  makePrefParams,
  fetch,
  Track,
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
  wrongOtpMsg: strings.wrontOtp,

  Constants,
  Bank,
  Wallet,
  SessionManager,
  Checkout,
  Bridge,

  getQueryParams: _.getQueryParams,

  Customer,
  getCustomer,
  sanitizeTokens,

  emiView,
  emandateView,
  Curtain,
};
