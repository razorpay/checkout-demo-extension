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

function Customer (key) {
  this.key = key;

  var saved_customer = preferences.customer;
  if (saved_customer) {
    if (saved_customer.customer_id) {
      this.id = saved_customer.customer_id;
      this.id_key = 'customer_id';
      this.local = true;
    } else {
      this.id = saved_customer.app_token;
      this.id_key = 'app_token';
    }
    this.contact = saved_customer.contact;
    this.tokens = saved_customer.tokens;
    this.saved = true;
    // this.wants_skip = false;
  } else {
    this.saved = preferences.saved;
  }
}

Customer.prototype = {
  lookup: function(callback){
    var customer = this;
    $.ajax({
      url: makeAuthUrl(this.key, 'customers/status/' + this.contact),
      callback: function(data){
        customer.saved = !!data.saved;
        callback();
      }
    })
  },

  login: function(){
    $.post({
      url: makeAuthUrl(this.key, 'otp/create'),
      data: {
        contact: this.contact
      }
    })
  },

  verify: function(otp, callback){
    var user = this;
    $.post({
      url: makeAuthUrl(this.key, 'otp/verify'),
      data: {
        contact: this.contact,
        otp: otp
      },
      callback: function(data){
        user.id = data.app_token;
        user.tokens = data.tokens;
        user.device_token = data.device_token;

        if (CheckoutBridge) {
          if(CheckoutBridge.setAppToken) {
            CheckoutBridge.setAppToken(user.id);
          }
          if(CheckoutBridge.setDeviceToken) {
            CheckoutBridge.setDeviceToken(user.device_token);
          }
        }

        if (data.error) {
          callback(discreet.msg.wrongotp);
        } else {
          callback();
        }
      }
    })
  },

  update: function(contact) {
    if (!this.local && this.contact !== contact) {
      this.id = this.saved = this.wants_skip = this.tokens = null;
      this.contact = contact;
    }
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