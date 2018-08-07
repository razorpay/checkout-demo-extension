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
import * as Curtain from 'components/curtain';

export default {
  RazorpayConfig,
  makeAuthUrl,
  makePrefParams,
  fetch,
  Track,
  UPIUtils,
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
  Curtain,
};