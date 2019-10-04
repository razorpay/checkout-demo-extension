import 'entry/checkout-frame';
import {
  RazorpayConfig,
  makeAuthUrl,
  makePrefParams,
  validateOverrides,
} from 'common/Razorpay';

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
import FeeBearerView from 'checkoutframe/feebearer';
import SavedCardsView from 'checkoutframe/savedcards';
import emandateView from 'checkoutframe/emandate';
import emiOptionsView from 'checkoutframe/emioptions';
import emiScreenView from 'checkoutframe/emiscreen';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import PayLaterView from 'checkoutframe/paylater';
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
import OTPScreenStore from 'checkoutstore/screens/otp';

import QRScreen from 'templates/views/qr.svelte';
import BankTransferScreen from 'templates/views/bank_transfer.svelte';
import MagicView from 'checkoutframe/magic';
import UpiTab from 'templates/tabs/upi/index.svelte';
import NetbankingTab from 'templates/tabs/netbanking/index.svelte';
import NachScreen from 'templates/views/nach.svelte';

import PayoutsInstruments from 'templates/screens/payout-instruments.svelte';
import PayoutAccount from 'templates/screens/payout-account.svelte';

import * as Hacks from 'checkoutframe/hacks';

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
  MethodsList,
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
  OptionsList,
  commonBanks,
  timer: _.timer,
  QRScreen,
  BankTransferScreen,
  getFullBankLogo,

  MagicView,
  UpiTab,
  NetbankingTab,
  NachScreen,

  Hacks,

  _Arr,
  _Doc,
  _El,
  _Func,
  _Obj,
  _,
};
