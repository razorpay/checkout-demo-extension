import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { isRecurring, isSubscription, isOneClickCheckout } from 'razorpay';
import { definePlatform } from 'upi/helper/upi';
import * as UserAgent from 'common/useragent';
import { INTERNATIONAL_APPS } from 'common/international';
import {
  getOption,
  getPreferences,
  isCustomerFeeBearer,
} from 'razorpay/helper';
import Analytics from 'analytics';

const androidSDK = definePlatform('androidSDK');
const iosSDK = definePlatform('iosSDK');
const isSDK = androidSDK || iosSDK;
const isWeb = !isSDK;
const isDesktop = isWeb && UserAgent.isDesktop();
const isMobileWeb = isWeb && !isDesktop;

const envs = [
  function chrome_mobile() {
    return UserAgent.chrome && isMobileWeb;
  },

  function chrome_desktop() {
    return UserAgent.chrome && isDesktop;
  },

  function safari_mobile() {
    return UserAgent.Safari && isMobileWeb;
  },

  function safari_desktop() {
    return UserAgent.Safari && isDesktop;
  },

  function firefox_mobile() {
    return UserAgent.firefox && isMobileWeb;
  },

  function firefox_desktop() {
    return UserAgent.firefox && isDesktop;
  },

  function ie11() {
    return UserAgent.internetExplorer;
  },

  function insta_fb_iab() {
    return UserAgent.isFacebookWebView();
  },

  function android_webview() {
    return isWeb && UserAgent.AndroidWebView;
  },

  function ios_webview() {
    return isWeb && UserAgent.iosWebView;
  },

  function android_sdk() {
    return androidSDK;
  },

  function ios_sdk() {
    return iosSDK;
  },
];

const methods = [
  function card_unsaved(data) {
    return data.method === 'card' && data['card[number]'];
  },

  function card_saved(data) {
    return data.method === 'card' && data.token;
  },

  function emi_unsaved_card(data) {
    return data.method === 'emi' && data['card[number]'];
  },

  function emi_saved_card(data) {
    return data.method === 'emi' && data.token;
  },

  function upi_qr(data) {
    return (
      data.method === 'upi' && data['_[flow]'] === 'intent' && data['_[upiqr]']
    );
  },

  function upi_intent(data) {
    return (
      data.method === 'upi' && data['_[flow]'] === 'intent' && !data['_[upiqr]']
    );
  },

  function upi_omnichannel(data) {
    return data.method === 'upi' && data.upi_provider === 'google_pay';
  },

  function upi_otm(data) {
    return data.method === 'upi' && data['upi[type]'] === 'otm';
  },

  function upi_collect_unsaved_vpa(data) {
    return data.vpa;
  },

  function upi_collect_saved_vpa(data) {
    return data.method === 'upi' && data.token;
  },

  function emandate(data) {
    return data.method === 'emandate';
  },

  function cardless_emi(data) {
    return data.method === 'cardless_emi';
  },

  function paylater(data) {
    return data.method === 'paylater';
  },

  function wallet(data) {
    return data.method === 'wallet';
  },

  function netbanking(data) {
    return data.method === 'netbanking';
  },

  function bank_transfer(data) {
    return data.method === 'bank_transfer';
  },

  function offline_challan(data) {
    return data.method === 'offline_challan';
  },

  function nach(data) {
    return data.method === 'nach';
  },

  function app(data) {
    return data.method === 'app';
  },

  function international(data) {
    return (
      data.method === 'app' &&
      Object.values(INTERNATIONAL_APPS).includes(data.provider)
    );
  },
];

export default [
  ...methods,
  ...envs,

  function recurring() {
    return isRecurring();
  },

  function subscription() {
    return isSubscription();
  },

  function vernacular() {
    const lang = get(locale);
    return lang && lang !== 'en';
  },

  function callback_url() {
    return getOption('callback_url');
  },

  function optional_contact() {
    return (getPreferences('optional') || [])?.includes('contact');
  },

  function customer_feebearer() {
    return isCustomerFeeBearer();
  },

  function offer(data) {
    return data.offer_id;
  },

  function partial_payment() {
    return getPreferences('order.partial_payment');
  },

  function downtime_high(data) {
    return data.downtimeSeverity === 'high';
  },

  function downtime_low(data) {
    return data.downtimeSeverity === 'low';
  },

  function p13n() {
    const meta = Analytics.getMeta() || {};
    return meta['doneByP13n'];
  },

  function avs(data) {
    return data.method === 'card' && data['billing_address[postal_code]'];
  },

  function timeout() {
    return getOption('timeout');
  },

  function checkout_config() {
    return getOption('config') || getPreferences('checkout_config');
  },

  function keyless() {
    return !getOption('key');
  },

  function without_retry() {
    return !getOption('retry');
  },

  function magic() {
    return isOneClickCheckout();
  },
];
