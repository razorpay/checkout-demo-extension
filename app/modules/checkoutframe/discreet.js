import 'entry/checkout-frame';
import RazorpayConfig from 'common/RazorpayConfig';

import Analytics, { Track } from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import ErrorService from 'error-service';
import * as UPIUtils from 'common/upi';
import * as GPay from 'gpay';
import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import * as Currency from 'common/currency';
import * as OtpService from 'common/otpservice';
import * as strings from 'common/strings';
import * as UserAgent from 'common/useragent';
import * as CardHelper from 'card/helper';
import emiView from 'checkoutframe/emi';
import FeeBearerView from 'ui/components/feebearer.svelte';
import Overlay from 'ui/components/Overlay.svelte';
import AuthOverlay from 'ui/components/AuthOverlay.svelte';
import UserConfirmationOverlay from 'ui/components/overlay/UserConfirmation.svelte';
import OffersView from 'ui/components/offers/index.svelte';
import NoCostExplainer from 'ui/components/offers/NoCostExplainer.svelte';
import emiPlansView from 'checkoutframe/emiplans';
import otpView from 'checkoutframe/otp';
import languageSelectionView from 'ui/elements/LanguageSelection.svelte';
import * as I18n from 'i18n';
import UpiCancelReasonPicker from 'ui/components/UpiCancelReasonPicker.svelte';
import CancelReasonPicker from 'ui/components/cancellation-modals/CancelReasonPicker.svelte';
import NetbankingCancelReasonPicker from 'ui/components/cancellation-modals/NetbankingCancelReasonPicker.svelte';
import * as Curtain from 'components/curtain';
import { setShieldParams } from 'payment/validator';
import * as P13n from 'checkoutframe/personalization';
import { commonBanks, getFullBankLogo } from 'common/bank';
import * as CountryCodesUtil from 'common/countrycodes';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import * as merchantAnalyticsConstant from 'one_click_checkout/merchant-analytics/constant';
import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';

/* Required for merchant.js migration */
import * as Constants from 'common/constants';
import * as WebPaymentsApi from 'common/webPaymentsApi';
import * as Card from 'common/card';
import * as Wallet from 'common/wallet';
import * as CardlessEmi from 'common/cardlessemi';
import * as PayLater from 'common/paylater';
import * as Token from 'common/token';
import * as Apps from 'common/apps';
import * as SessionManager from 'sessionmanager';
import updateScore from 'analytics/checkoutScore';
import { trackUpiIntentInstrumentPaymentAttempted } from 'analytics/highlightUpiIntentAnalytics';
import * as Checkout from 'checkoutframe/index';
import * as Offers from 'checkoutframe/offers';
import * as Flows from 'checkoutframe/flows';
import { initIframe } from 'checkoutframe/iframe';
import * as Form from 'checkoutframe/form';
import { stopListeningForBackPresses } from 'bridge/back';
import * as Bridge from 'bridge';
import { Customer, getCustomer, sanitizeTokens } from 'checkoutframe/customer';
import * as CRED from 'checkoutframe/cred';
import { Formatter } from 'formatter';

import * as Store from 'checkoutstore';
import * as RazorpayHelper from 'razorpay';
import * as MethodStore from 'checkoutstore/methods';
import * as EmiStore from 'checkoutstore/emi';
import * as OTPScreenStore from 'checkoutstore/screens/otp';
import * as Cta from 'checkoutstore/cta';
import * as HomeScreenStore from 'checkoutstore/screens/home';
import * as CardScreenStore from 'checkoutstore/screens/card';
import * as NetbankingScreenStore from 'checkoutstore/screens/netbanking';
import * as UpiScreenStore from 'checkoutstore/screens/upi';
import * as CustomerStore from 'checkoutstore/customer';
import * as Theme from 'checkoutstore/theme';
import { overlayStack as overlayStackStore } from 'checkoutstore/back';
import * as NativeStore from 'checkoutstore/native';
import * as OffersStore from 'checkoutstore/offers';
import { reward as rewardsStore } from 'checkoutstore/rewards';
import * as address from 'one_click_checkout/address/sessionInterface';

import QRScreen from 'ui/tabs/qr/index.svelte';
import * as upiTab from 'checkoutframe/components/upi';
import CardlessEmiView from 'ui/tabs/cardless-emi/index.svelte';
import emiScreenView from 'ui/tabs/emi/emiscreen.svelte';
import PayLaterView from 'ui/tabs/paylater/index.svelte';
import HomeTab from 'ui/tabs/home/index.svelte';
import netbankingTab from 'checkoutframe/components/netbanking';
import EmandateTab from 'ui/tabs/emandate/index.svelte';
import NachScreen from 'ui/tabs/nach/index.svelte';
import * as cardTab from 'checkoutframe/components/card';
import * as walletTab from 'checkoutframe/components/wallet';
import * as Backdrop from 'checkoutframe/components/backdrop';
import * as Confirm from 'checkoutframe/components/confirm';
import * as FeeLabel from 'checkoutframe/components/fee';
import * as internationalTab from 'checkoutframe/components/international';
import * as InternationalStores from 'checkoutstore/screens/international';

import showTimer from 'checkoutframe/timer';
import * as es6components from 'checkoutframe/components';

import * as Hacks from 'checkoutframe/hacks';

import { get as storeGetter } from 'svelte/store';
/** Experiments */
import * as Experiments from 'experiments';
import * as CardExperiments from 'card/experiments';
/** Endof Experiments */
import BrowserStorage from 'browserstorage';

import * as NBHandlers from 'handlers/netbanking';
import * as CommonHandlers from 'handlers/common';

import * as Instruments from 'configurability/instruments';
import { getInstrumentMeta } from 'ui/tabs/home/instruments';
import * as ContactStorage from 'checkoutframe/contact-storage';
import BlockedDeactivatedMerchant from 'ui/elements/BlockedDeactivatedMerchant.svelte';
import { isInternationalInPreferredInstrument } from 'ui/tabs/international/helper';

import * as downtimeUtils from 'checkoutframe/downtimes/utils';
import * as UTILS from 'lib/utils.js';

import OneClickCheckoutHomeTab from 'one_click_checkout/ui/Home.svelte';
import * as CovidDonations from 'checkoutframe/components/covidWrap';
import * as Header from 'checkoutframe/components/header';
import * as ChargesHelper from 'one_click_checkout/charges/helpers';
import * as ChargesStore from 'one_click_checkout/charges/store';

import * as OneClickCheckoutStore from 'one_click_checkout/store';
import * as OneClickCheckoutInterface from 'one_click_checkout/sessionInterface';
import { dynamicFeeObject } from 'checkoutstore/dynamicfee';
import { views } from 'one_click_checkout/routing/constants';
import { Views as CardViews } from 'ui/tabs/card/constant';
import { OTP_TEMPLATES } from 'one_click_checkout/otp/constants';
import * as OtpTemplatesHelper from 'checkoutframe/sms_template';
import * as TrustedBadgeHelper from 'trusted-badge/helper';

import * as SecurityUtils from 'utils/security';

import * as offlineChallanTab from 'checkoutframe/components/offlineChallan';

export default {
  RazorpayConfig,
  updateScore,
  fetch,
  Track,
  Analytics,
  AnalyticsTypes,
  UPIUtils,
  UTILS,
  setShieldParams,
  GPay,
  Color,
  _PaymentMethodIcons,
  Confirm,
  FeeLabel,
  Currency,
  OtpService,
  currencies: Currency.displayCurrencies,
  error: _.rzpError,
  ErrorService,
  Formatter,
  Form,

  cancelMsg: strings.cancelMsg,

  initIframe,

  showTimer,
  es6components,

  Constants,
  WebPaymentsApi,
  Card,
  Wallet,
  CardlessEmi,
  PayLater,
  Token,
  SessionManager,
  Checkout,
  Bridge,
  stopListeningForBackPresses,
  P13n,
  Instruments,
  getInstrumentMeta,
  UserAgent,
  Offers,
  Flows,
  CountryCodesUtil,
  Theme,

  Store,
  MethodStore,
  CustomerStore,
  OTPScreenStore,
  HomeScreenStore,
  CardScreenStore,
  NetbankingScreenStore,
  UpiScreenStore,
  EmiStore,
  NativeStore,
  OffersStore,
  Cta,
  dynamicFeeObject,
  TrustedBadgeHelper,

  Customer,
  getCustomer,
  sanitizeTokens,

  emiView,
  CardlessEmiView,
  emiScreenView,
  emiPlansView,

  FeeBearerView,
  Backdrop,
  Overlay,
  AuthOverlay,
  UserConfirmationOverlay,
  OffersView,
  NoCostExplainer,

  otpView,
  languageSelectionView,
  UpiCancelReasonPicker,
  CancelReasonPicker,
  NetbankingCancelReasonPicker,
  PayLaterView,
  Curtain,
  commonBanks,
  timer: _.timer,
  QRScreen,
  getFullBankLogo,
  BlockedDeactivatedMerchant,

  HomeTab,
  upiTab,
  walletTab,
  netbankingTab,
  EmandateTab,
  NachScreen,
  cardTab,

  Hacks,
  storeGetter,
  Experiments,
  CardExperiments,
  CardHelper,
  BrowserStorage,

  _Arr,
  _Doc,
  _El,
  _Obj,
  _,
  Promise,

  NBHandlers,
  CommonHandlers,

  trackUpiIntentInstrumentPaymentAttempted,

  ContactStorage,
  I18n,
  overlayStackStore,
  rewardsStore,
  CRED,
  downtimeUtils,
  CovidDonations,
  Apps,
  Header,

  OneClickCheckoutHomeTab,
  OneClickCheckoutInterface,
  address,
  ChargesHelper,
  ChargesStore,
  OneClickCheckoutStore,
  OneClickCheckoutMetaProperties,
  RazorpayHelper,
  views,

  CardViews,
  OTP_TEMPLATES,
  OtpTemplatesHelper,

  // international payment method
  internationalTab,
  InternationalStores,

  isInternationalInPreferredInstrument,
  merchantAnalytics,
  merchantAnalyticsConstant,

  SecurityUtils,

  // Offline Challan
  offlineChallanTab,
};
