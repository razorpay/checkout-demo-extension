import { getSession } from 'sessionmanager';
import { makeAuthUrl } from 'common/Razorpay';
import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Bridge from 'bridge';
import * as strings from 'common/strings';

/* global errorHandler */

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

export const sanitizeTokens = (tokens, filters) => {
  let _filters = filters || {};
  let method = _filters.method || 'card',
    recurring = _filters.recurring || false;

  if (tokens) {
    let items = [];

    tokens.items
      |> _Obj.loop(item => {
        if (item.method === method && (recurring ? item.recurring : true)) {
          items.push(item);
        }
      });

    tokens
      |> _Obj.setProp('items', items)
      |> _Obj.setProp('count', items.length);
  }
};

Customer.prototype = {
  wants_skip: false,
  saved: false,
  logged: false,

  mark_logged: function(data) {
    var session = getSession();
    let recurring = session.recurring || false;
    this.logged = true;

    sanitizeTokens(data.tokens, {
      recurring: recurring,
    });

    this.tokens = data.tokens;

    if (!session.local) {
      _Doc.querySelector('#top-right') |> _El.addClass('logged');
    }

    Analytics.setMeta('loggedIn', true);
  },

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function(callback) {
    let customer = this;
    let url = makeAuthUrl(this.r, 'customers/status/' + this.contact);
    url += '&_[platform]=' + Track.props.platform;

    var device_token = qpmap.device_token;
    if (device_token) {
      url += '&device_token=' + device_token;
    }

    fetch({
      url: url,
      callback: function(data) {
        customer.saved = !!data.saved;
        if (data.tokens) {
          customer.mark_logged(data);
        }
        callback();
      },
    });
  },

  createOTP: function(callback) {
    fetch.post({
      url: makeAuthUrl(this.r, 'otp/create'),
      data: {
        contact: this.contact,
      },
      callback: callback,
    });
  },

  submitOTP: function(data, callback) {
    let user = this;

    data.contact = this.contact;
    let url = makeAuthUrl(this.r, 'otp/verify');

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
            errorHandler.call(getSession(), data);
          } else {
            callback(strings.wrongOtp);
          }
        } else {
          callback();
        }
      },
    });
  },

  deleteCard: function(token, callback) {
    let user = this;

    if (!this.id) {
      return;
    }

    fetch({
      url: makeAuthUrl(this.r, 'apps/' + this.id + '/tokens/' + token),
      method: 'delete',
      callback: function() {
        callback();
        deleteToken(user, token);
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

export const deleteToken = (user, token) => {
  let tokens = user.tokens;
  for (var i = 0; i < tokens.count; i++) {
    if (tokens.items[i].token === token) {
      tokens.items.splice(i, 1);
      tokens.count--;
      return;
    }
  }
};
