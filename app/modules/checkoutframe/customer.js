import { getSession } from 'sessionmanager';
import { makeAuthUrl } from 'common/Razorpay';
import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Bridge from 'bridge';
import * as strings from 'common/strings';
import * as OtpService from 'common/otpservice';
import { isRecurring, getRecurringMethods } from 'checkoutstore';

/* global getPhone */

let customers = {};
let qpmap = _.getQueryParams();

export const getCustomer = contact => {
  // indian contact without +91
  let indianContact;

  if (contact) {
    indianContact = contact.length === 10 && contact[0] !== '+';
  }
  if (!(contact in customers)) {
    if (indianContact) {
      return getCustomer('+91' + contact);
    } else {
      customers[contact] = new Customer(contact);
    }
  }
  return customers[contact];
};

export function Customer(contact) {
  if (contact) {
    this.contact = contact.replace(/[^+\d]/g, '');
  }
}

export const sanitizeTokens = tokens => {
  const recurring = isRecurring();
  const recurringMethods = getRecurringMethods();
  const recurringCreditCardNetworks = recurringMethods?.card?.credit ?? [];
  const recurringDebitCardIssuers = Object.keys(
    recurringMethods?.card?.debit ?? {}
  );

  if (tokens) {
    tokens.items = tokens.items.filter(token => {
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

  mark_logged: function(data) {
    var session = getSession();
    this.logged = true;

    sanitizeTokens(data.tokens);

    this.tokens = data.tokens;

    if (!session.local) {
      session.topBar.setLogged(true);
    }

    Analytics.setMeta('loggedIn', true);
  },

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function(callback, queryParams, contact) {
    let customer = this;
    let url = 'customers/status/' + (this.contact || contact);

    if (queryParams) {
      url = `${url}?${_.obj2query(queryParams)}`;
    }

    url = makeAuthUrl(this.r, url);

    url += '&_[platform]=' + Track.props.platform;

    var device_token = qpmap.device_token;
    if (device_token) {
      url += '&device_token=' + device_token;
    }

    fetch({
      url: url,
      callback: function(data) {
        customer.saved = !!data.saved;

        if (customer.saved) {
          OtpService.markOtpSent('razorpay');
        }

        if (data.tokens) {
          customer.mark_logged(data);
        }

        callback && callback(data);
      },
    });
  },

  createOTP: function(callback, queryParams) {
    let url = 'otp/create';

    if (queryParams) {
      url = `${url}?${_.obj2query(queryParams)}`;
    }

    fetch.post({
      url: makeAuthUrl(this.r, url),
      data: {
        contact: this.contact,
      },
      callback: function(data) {
        OtpService.markOtpSent('razorpay');
        callback && callback(data);
      },
    });
  },

  submitOTP: function(data, callback, queryParams) {
    let user = this;

    // TODO: fix this
    data.contact = this.contact || getCustomer(getPhone()).contact;
    let url = 'otp/verify';

    if (queryParams) {
      url = `${url}?${_.obj2query(queryParams)}`;
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
      callback: function(data) {
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
            callback(strings.wrongOtp);
          }
        } else {
          callback(undefined, data);
        }
      },
    });
  },

  logout: function(this_device, callback) {
    Analytics.track('logout', {
      type: AnalyticsTypes.BEHAV,
      data: {
        all: !this_device,
      },
    });

    let ajaxOpts = {
      url: makeAuthUrl(this.r, 'apps/logout'),
      method: 'delete',
      callback: callback,
    };

    ajaxOpts.url += '&logout=' + (this_device ? 'app' : 'all');

    fetch.setSessionId(null);

    Analytics.removeMeta('loggedIn');
    fetch(ajaxOpts);
  },
};
