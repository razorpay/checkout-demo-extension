var customers = {};

var getCustomer = function(contact) {
  if (!(contact in customers)) {
    customers[contact] = new Customer(contact);
  }
  return customers[contact];
}

function Customer(contact) {
  if (contact) {
    this.contact = contact.replace(/\D/g, '');
  }
}

function sanitizeTokens(tokens){
  if (tokens) {
    var items = [];
    each(
      tokens.items,
      function(index, item) {
        if (item.method === 'card') {
          items.push(item);
        }
      }
    )
    tokens.items = items;
    tokens.count = items.length;
  }
}

Customer.prototype = {
  key: '',
  wants_skip: false,
  saved: false,
  logged: false,

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function(callback){
    var customer = this;
    var url = makeAuthUrl(this.key, 'customers/status/' + this.contact);
    var device_token = qpmap.device_token;
    if (device_token) {
      url += '&device_token=' + device_token;
    }
    $.ajax({
      url: url,
      callback: function(data){
        customer.saved = !!data.saved;
        if (data.tokens) {
          customer.logged = true;
          sanitizeTokens(data.tokens);
          customer.tokens = data.tokens;
        }
        callback();
      }
    })
  },

  createOTP: function(callback){
    $.post({
      url: makeAuthUrl(this.key, 'otp/create'),
      data: {
        contact: this.contact
      },
      callback: callback
    })
  },

  submitOTP: function(data, callback){
    var user = this;
    data.contact = this.contact;
    var url = makeAuthUrl(this.key, 'otp/verify');

    if (qpmap.platform === 'android' && qpmap.version && qpmap.library) {
      data['_[platform]'] = 'android';
      data['_[version]'] = qpmap.version;
      data['_[library]'] = qpmap.library;
    }

    $.post({
      url: url,
      data: data,
      callback: function(data){
        user.logged = data.success;
        sanitizeTokens(data.tokens);
        user.tokens = data.tokens;
        qpmap.device_token = data.device_token;

        if (qpmap.device_token) {
          invoke('setDeviceToken', CheckoutBridge, qpmap.device_token);
        }

        if (data.error) {
          callback(discreet.msg.wrongotp);
        } else {
          callback();
        }
      }
    })
  },

  deleteCard: function(token, callback){
    var user = this;
    if (!this.id) {
      return;
    }
    $.ajax({
      url: makeAuthUrl(this.key, 'apps/' + this.id + '/tokens/' + token),
      method: 'delete',
      callback: function(){
        callback();
        deleteToken(user, token);
      }
    })
  }
}

function deleteToken(user, token){
  var tokens = user.tokens;
  for (var i = 0; i < tokens.count; i++){
    if(tokens.items[i].token === token){
      tokens.items.splice(i, 1 );
      tokens.count--;
      return;
    }
  }
}
