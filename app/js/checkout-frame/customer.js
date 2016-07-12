var customers = {};

var getCustomer = function(contact) {
  if (contact && !(contact in customers)) {
    customers[contact] = new Customer(contact);
  }
  return customers[contact];
}

function Customer(contact) {
  this.contact = contact;
}

Customer.prototype = {
  key: '',
  id_key: 'app_token',
  wants_skip: false,
  saved: false,

  // NOTE: status check api also sends otp if customer exist
  checkStatus: function(callback){
    var customer = this;
    $.ajax({
      url: makeAuthUrl(this.key, 'customers/status/' + this.contact),
      callback: function(data){
        customer.saved = !!data.saved;
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
    $.post({
      url: makeAuthUrl(this.key, 'otp/verify'),
      data: data,
      callback: function(data){
        user.id = data.success;
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
