import 'entry/checkout-frame';
import RazorpayConfig from 'common/RazorpayConfig';

import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as UPIUtils from 'common/upi';
import * as GPay from 'gpay';
import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import * as Confirm from 'confirm';
import * as Currency from 'common/currency';
import * as OtpService from 'common/otpservice';
import * as strings from 'common/strings';
import * as UserAgent from 'common/useragent';
import emiView from 'checkoutframe/emi';
import FeeBearerView from 'ui/components/feebearer.svelte';
import Overlay from 'ui/components/Overlay.svelte';
import AuthOverlay from 'ui/components/AuthOverlay.svelte';
import OffersView from 'ui/components/offers/index.svelte';
import NoCostExplainer from 'ui/components/offers/NoCostExplainer.svelte';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import languageSelectionView from 'ui/elements/LanguageSelection.svelte';
import * as I18n from 'i18n';
import { init as initI18n } from 'i18n/init';
import UpiCancelReasonPicker from 'ui/components/UpiCancelReasonPicker.svelte';
import * as Curtain from 'components/curtain';
import { setShieldParams } from 'payment/validator';
import * as P13n from 'checkoutframe/personalization';
import { commonBanks, getFullBankLogo } from 'common/bank';
import * as CountryCodesUtil from 'common/countrycodes';

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
import * as NetbankingScreenStore from 'checkoutstore/screens/netbanking';
import * as CustomerStore from 'checkoutstore/customer';
import * as Theme from 'checkoutstore/theme';

import QRScreen from 'ui/tabs/qr/index.svelte';
import * as upiTab from 'checkoutframe/components/upi';
import CardlessEmiView from 'ui/tabs/cardless-emi/index.svelte';
import emiScreenView from 'ui/tabs/emi/emiscreen.svelte';
import PayLaterView from 'ui/tabs/paylater/index.svelte';
import HomeTab from 'ui/tabs/home/index.svelte';
import netbankingTab from 'checkoutframe/components/netbanking';
import EmandateTab from 'ui/tabs/emandate/index.svelte';
import NachScreen from 'ui/tabs/nach/index.svelte';
import CardTab from 'ui/tabs/card/index.svelte';
import * as walletTab from 'checkoutframe/components/wallet';
import TopBar from 'ui/components/Topbar.svelte';

import PayoutsInstruments from 'ui/tabs/payout/payout-instruments.svelte';
import PayoutAccount from 'ui/tabs/payout/payout-account.svelte';

import showTimer from 'checkoutframe/timer';
import * as es6components from 'checkoutframe/components';

import * as Hacks from 'checkoutframe/hacks';

import { get as storeGetter } from 'svelte/store';
import * as Experiments from 'experiments';

import * as NBHandlers from 'handlers/netbanking';

import * as Instruments from 'configurability/instruments';
import { getInstrumentMeta } from 'ui/tabs/home/instruments';

export default {
  RazorpayConfig,
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

  showTimer,
  es6components,

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
  Instruments,
  getInstrumentMeta,
  UserAgent,
  Offers,
  Flows,
  Payouts,
  CountryCodesUtil,
  Theme,

  Store,
  MethodStore,
  SessionStore,
  CustomerStore,
  OTPScreenStore,
  HomeScreenStore,
  CardScreenStore,
  NetbankingScreenStore,
  EmiStore,
  Cta,

  Customer,
  getCustomer,
  sanitizeTokens,

  emiView,
  CardlessEmiView,
  emiScreenView,
  emiPlansView,

  FeeBearerView,
  Overlay,
  AuthOverlay,
  OffersView,
  NoCostExplainer,
  PayoutsInstruments,
  PayoutAccount,

  otpView,
  languageSelectionView,
  UpiCancelReasonPicker,
  PayLaterView,
  Curtain,
  TopBar,
  commonBanks,
  timer: _.timer,
  QRScreen,
  getFullBankLogo,

  HomeTab,
  upiTab,
  walletTab,
  netbankingTab,
  EmandateTab,
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

  initI18n,
  I18n,
};
