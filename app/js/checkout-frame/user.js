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

function User (user, key) {
  if (user) {
    this.app_token = user.app_token || null;
    this.email = user.email || '';
    this.contact = user.contact || '';
    this.tokens = user.tokens || null;
  }
  this.saved = !!user;
  this.wants_skip = false;
  this.key = key;
}

User.prototype = {
  lookup: function(callback){
    var user = this;
    $.ajax({
      url: makeAuthUrl(this.key, 'customer/status/' + this.contact),
      callback: function(data){
        user.saved = !!data.saved;
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
        user.app_token = data.app_token;
        user.tokens = data.tokens;
        user.device_token = data.device_token;

        if (CheckoutBridge) {
          if(CheckoutBridge.setAppToken) {
            CheckoutBridge.setAppToken(user.app_token);
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

  setPhone: function(phone){
    if (this.contact !== phone) {
      this.app_token = this.saved = this.wants_skip = this.tokens = null;
      this.contact = phone;
    }
  },

  deleteCard: function(token, callback){
    var user = this;
    if (!this.app_token) {
      return;
    }
    $.ajax({
      url: makeAuthUrl(this.key, 'apps/' + this.app_token + '/tokens/' + token),
      method: 'delete',
      callback: function(){
        callback();
        deleteToken(user, token);
      }
    })
  }
}