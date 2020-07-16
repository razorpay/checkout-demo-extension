import { getSession } from 'sessionmanager';
import { makeAuthUrl } from 'common/Razorpay';
import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Bridge from 'bridge';
import * as OtpService from 'common/otpservice';
import { isRecurring } from 'checkoutstore';
import { format, getCurrentLocale } from 'i18n';

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

  if (tokens) {
    tokens.items = tokens.items.filter(item => {
      if (recurring && !item.recurring) {
        return false;
      }
      // only allow card and upi tokens
      if (item.method === 'card' || item.method === 'upi') {
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

    url = _.appendParamsToUrl(url, { language_code: getCurrentLocale() });

    if (queryParams) {
      url = _.appendParamsToUrl(url, queryParams);
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

    url = _.appendParamsToUrl(url, { language_code: getCurrentLocale() });

    if (queryParams) {
      url = _.appendParamsToUrl(url, queryParams);
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

    url = _.appendParamsToUrl(url, { language_code: getCurrentLocale() });

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
            callback(format('otp.title.incorrect_otp_retry'));
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

    let url = makeAuthUrl(this.r, 'apps/logout');

    url = _.appendParamsToUrl(url, {
      language_code: getCurrentLocale(),
      logout: this_device ? 'app' : 'all',
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
};
