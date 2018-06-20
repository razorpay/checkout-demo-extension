var customers = {};

var getCustomer = function(contact) {
  // indian contact without +91
  var indianContact;
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

function Customer(contact) {
  if (contact) {
    this.contact = contact.replace(/[^+\d]/g, '');
  }
}

function sanitizeTokens(tokens, filters) {
  var _filters = filters || {};
  var method = _filters.method || 'card',
    recurring = _filters.recurring || false;

  if (tokens) {
    var items = [];
    each(tokens.items, function(index, item) {
      if (item.method === method && (recurring ? item.recurring : true)) {
        items.push(item);
      }
    });
    tokens.items = items;
    tokens.count = items.length;
  }
}

Customer.prototype = {
  wants_skip: false,
  saved: false,
  logged: false,

  mark_logged: function(data) {
    var recurring = getSession().recurring || false;
    this.logged = true;
    sanitizeTokens(data.tokens, {
      recurring: recurring
    });
    this.tokens = data.tokens;
    if (!getSession().local) {
      $('#top-right').addClass('logged');
    }
  },

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function(callback) {
    var customer = this;
    var url = makeAuthUrl(this.r, 'customers/status/' + this.contact);
    url += '&_[platform]=' + trackingProps.platform;
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
      }
    });
  },

  createOTP: function(callback) {
    fetch.post({
      url: makeAuthUrl(this.r, 'otp/create'),
      data: {
        contact: this.contact
      },
      callback: callback
    });
  },

  submitOTP: function(data, callback) {
    var user = this;
    data.contact = this.contact;
    var url = makeAuthUrl(this.r, 'otp/verify');

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

        _session_id = data.session_id;

        if (qpmap.device_token) {
          invoke('setDeviceToken', CheckoutBridge, qpmap.device_token);
        }

        if (data.error) {
          if (data.error.field) {
            errorHandler.call(getSession(), data);
          } else {
            callback(discreet.msg.wrongotp);
          }
        } else {
          callback();
        }
      }
    });
  },

  deleteCard: function(token, callback) {
    var user = this;
    if (!this.id) {
      return;
    }
    fetch({
      url: makeAuthUrl(this.r, 'apps/' + this.id + '/tokens/' + token),
      method: 'delete',
      callback: function() {
        callback();
        deleteToken(user, token);
      }
    });
  },

  logout: function(this_device, callback) {
    var ajaxOpts = {
      url: makeAuthUrl(this.r, 'apps/logout'),
      method: 'delete',
      callback: callback
    };
    ajaxOpts.url += '&logout=' + (this_device ? 'app' : 'all');

    _session_id = null;

    $.ajax(ajaxOpts);
  }
};

function deleteToken(user, token) {
  var tokens = user.tokens;
  for (var i = 0; i < tokens.count; i++) {
    if (tokens.items[i].token === token) {
      tokens.items.splice(i, 1);
      tokens.count--;
      return;
    }
  }
}
