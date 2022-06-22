import { getSession } from 'sessionmanager';
import { makeAuthUrl } from 'common/helper';
import fetch from 'utils/fetch';
import Analytics, {
  Track,
  Events,
  MetaProperties,
  CardEvents,
  MiscEvents,
} from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Bridge from 'bridge';
import * as OtpService from 'common/otpservice';
import RazorpayStore, {
  getRecurringMethods,
  isOneClickCheckout,
  isRecurring,
} from 'razorpay';
import { delayLoginOTPExperiment } from 'card/helper';
import { timer } from 'utils/timer';
import { get } from 'svelte/store';
import { contact } from 'checkoutstore/screens/home';
import { isLoggedIn } from 'checkoutstore/customer';

let customers = {};
let qpmap = _.getQueryParams();
const URL_NOT_FOUND = 'The requested URL was not found on the server.';
const ONECC_VERIFY_OTP = '1cc/otp/verify';
const VERIFY_OTP = 'otp/verify';

export const getCustomer = (contact, savedCustomer, skipStatusCall = false) => {
  // indian contact without +91
  let indianContact;

  if (contact) {
    indianContact = contact.length === 10 && contact[0] !== '+';
  }
  if (!(contact in customers)) {
    if (indianContact) {
      return getCustomer('+91' + contact, savedCustomer);
    } else {
      customers[contact] = new Customer(contact, savedCustomer, skipStatusCall);
    }
  }
  return customers[contact];
};

export function Customer(
  contact,
  savedCustomer = false,
  skipStatusCall = false
) {
  if (contact) {
    this.contact = contact.replace(/[^+\d]/g, '');
    this.r = RazorpayStore.get();
    this.haveSavedCard = true; // for default flow (non-experiment delay otp)
    if (delayLoginOTPExperiment()) {
      this.haveSavedCard = savedCustomer;
      // skip api call if user is logged in
      if (!savedCustomer && !skipStatusCall) {
        this.checkStatus(
          (data) => {
            this.haveSavedCard = data.saved;
          },
          { skip_otp: true }
        );
      }
    }
  }
}

export const sanitizeTokens = (tokens) => {
  const recurring = isRecurring();
  const recurringMethods = getRecurringMethods();
  const recurringCreditCardNetworks = recurringMethods?.card?.credit ?? [];
  const recurringPrepaidCardNetworks = recurringMethods?.card?.prepaid ?? [];
  const recurringDebitCardIssuers = Object.keys(
    recurringMethods?.card?.debit ?? {}
  );
  if (tokens) {
    tokens.items = tokens.items.filter((token) => {
      if (recurring) {
        if (!token.recurring) {
          return false;
        }

        const card = token.card;

        if (card) {
          const cardType = card.type;

          if (cardType === 'credit') {
            return recurringCreditCardNetworks.includes(card.network);
          } else if (cardType === 'debit') {
            return recurringDebitCardIssuers.includes(card.issuer);
          } else if (cardType === 'prepaid') {
            return recurringPrepaidCardNetworks.includes(card.network);
          } else {
            return false;
          }
        }
      }

      // only allow card and upi tokens
      if (token.method === 'card' || token.method === 'upi') {
        return true;
      }
    });
    tokens.count = tokens.items.length;
  }
};

Customer.prototype = {
  wants_skip: false,
  saved: false,
  logged: false,
  tokens: null,

  mark_logged: function (data) {
    let session = getSession();
    this.logged = true;
    isLoggedIn.set(true);

    sanitizeTokens(data.tokens);

    this.tokens = data.tokens;

    if (!session.local) {
      session.topBar.setLogged(true);
    }

    Events.setMeta(MetaProperties.LOGGEDIN, true);
  },

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function (callback, queryParams, contact) {
    let customer = this;
    let url = 'customers/status/' + (this.contact || contact);

    if (queryParams) {
      url = _.appendParamsToUrl(url, queryParams);
    }

    url = makeAuthUrl(this.r, url);

    url += '&_[platform]=' + Track.props.platform;

    let device_token = qpmap.device_token;
    if (device_token) {
      url += '&device_token=' + device_token;
    }

    const getDuration = timer();
    Events.TrackMetric(MiscEvents.CUSTOMER_STATUS_START);
    Events.TrackMetric(MiscEvents.CUSTOMER_STATUS_API_INITIATED);

    fetch({
      url: url,
      callback: function (data) {
        const hasSavedCards = !!data.saved;
        customer.saved = hasSavedCards;
        customer.saved_address = !!data.saved_address;

        Events.setMeta(
          MetaProperties.HAS_SAVED_CARDS_STATUS_CHECK,
          hasSavedCards
        );
        const eventProperties = {
          response_time: getDuration(),
          api_response: data,
          has_saved_cards: hasSavedCards,
          has_saved_addresses: !!data.saved_address,
        };
        if (data?.error) {
          eventProperties['error_reason'] = data?.error;
        }
        Events.TrackMetric(
          MiscEvents.CUSTOMER_STATUS_API_COMPLETED,
          eventProperties
        );
        Events.setMeta(
          MetaProperties.HAS_SAVED_ADDRESSES,
          !!data.saved_address
        );

        Events.TrackBehav(CardEvents.CHECK_SAVED_CARDS, {
          hasSavedCards,
        });

        Events.TrackMetric(MiscEvents.CUSTOMER_STATUS_END, {
          response_time: getDuration(),
          response: data,
        });

        if (customer.saved && !queryParams.skip_otp) {
          OtpService.markOtpSent('razorpay');
        }

        if (data.tokens) {
          customer.mark_logged(data);
        }

        callback && callback(data);
      },
    });
  },

  /**
   *
   * @param {function} callback callback to be executed after response is received.
   * @param {object} queryParams additional query params to be sent with the request.
   * @param {string} otp_reason template name which is sent in payload to BE.
   */
  createOTP: function (callback, queryParams, otp_reason = '') {
    let url = 'otp/create';

    if (queryParams) {
      url = _.appendParamsToUrl(url, queryParams);
    }

    fetch.post({
      url: makeAuthUrl(this.r, url),
      data: {
        contact: this.contact,
        otp_reason,
      },
      callback: function (data) {
        OtpService.markOtpSent('razorpay');
        callback && callback(data);
      },
    });
  },

  submitOTP: function (data, callback, queryParams, endPoint) {
    let user = this;
    let otpData = data;
    const isOneCCEnabled = isOneClickCheckout();
    // TODO: fix this
    data.contact = this.contact || getCustomer(get(contact)).contact;
    let url = endPoint || (isOneCCEnabled ? ONECC_VERIFY_OTP : VERIFY_OTP);

    if (queryParams) {
      url = _.appendParamsToUrl(url, queryParams);
    }

    url = makeAuthUrl(this.r, url);

    if (qpmap.platform === 'android' && qpmap.version && qpmap.library) {
      data['_[platform]'] = 'android';
      data['_[version]'] = qpmap.version;
      data['_[library]'] = qpmap.library;
    }

    fetch.post({
      url: url,
      data: data,
      callback: function (data) {
        if (
          data?.error?.description === URL_NOT_FOUND &&
          url.includes(ONECC_VERIFY_OTP)
        ) {
          // The fix is for temporary need to remove once BE API stabilized
          user.submitOTP(otpData, callback, queryParams, VERIFY_OTP);
          return;
        }
        if (data.success) {
          user.mark_logged(data);
        }
        qpmap.device_token = data.device_token;

        fetch.setSessionId(data.session_id);

        if (qpmap.device_token) {
          Bridge.checkout.callAndroid('setDeviceToken', qpmap.device_token);
        }

        if (data.error) {
          if (data.error.field) {
            getSession().errorHandler(data);
          } else {
            let errorMsg = '';
            if (isOneCCEnabled) {
              errorMsg = 'otp.title.incorrect_otp_retry_one_cc';
            } else {
              errorMsg = 'incorrect_otp_retry';
            }
            callback(errorMsg);
          }
        } else {
          callback(undefined, data);
        }
      },
    });
  },

  logout: function (allDevice, callback) {
    Analytics.track('logout', {
      type: AnalyticsTypes.BEHAV,
      data: {
        all: allDevice,
      },
    });

    let url = makeAuthUrl(this.r, 'apps/logout');

    url = _.appendParamsToUrl(url, {
      logout: !allDevice ? 'app' : 'all',
    });

    let ajaxOpts = {
      url,
      method: 'delete',
      callback,
    };

    fetch.setSessionId(null);

    Analytics.removeMeta('loggedIn');
    fetch(ajaxOpts);
  },

  markLoggedOut: function () {
    this.logged = false;
    this.tokens = null;

    isLoggedIn.set(false);
  },
};
