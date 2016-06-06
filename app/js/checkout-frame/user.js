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

function User (o) {
  this.app_token = o.app_token || null;
  this.device_token = o.device_token || null;
  this.phone = o.phone || '';
  this.saved = o.saved || null;
  this.wants_skip = o.wants_skip || null;
  this.tokens = o.tokens || null;
}

User.prototype = {
  lookup: function(callback){
    var user = this;
    $.ajax({
      url: discreet.makeUrl() + 'customer/status/' + this.phone + '?key_id=' +
      this.key,
      callback: function(data){
        user.saved = !!data.saved;
        callback();
      }
    })
  },

  login: function(){
    $.post({
      url: discreet.makeUrl() + 'otp/create?key_id=' + this.key,
      data: {
        contact: this.phone
      }
    })
  },

  verify: function(otp, callback){
    var user = this;
    $.post({
      url: discreet.makeUrl() + 'otp/verify?key_id=' + this.key,
      data: {
        contact: this.phone,
        otp: otp
      },
      callback: function(data){
        user.app_token = data.app_token;
        user.tokens = data.tokens;
        user.device_token = data.device_token;
        if (data.error) {
          callback(discreet.msg.wrongotp);
        } else {
          callback();
        }
      }
    })
  },

  setPhone: function(phone){
    if (this.phone !== phone) {
      this.app_token = this.saved = this.wants_skip = this.tokens = null;
      this.phone = phone;
    }
  },

  deleteCard: function(token, callback){
    var user = this;

    if (!this.app_token) {
      return;
    }

    $.ajax({
      url: discreet.makeUrl() + 'apps/' + user.app_token + '/tokens/' + token +
        '?key_id=' + user.key,
      method: 'delete',
      callback: function(){
        callback();
        deleteToken(user, token);
      }
    })
  }
}