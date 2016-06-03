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
  this.id = o.id || null;
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
        user.saved = true;
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
        user.id = data.app_id;
        user.tokens = data.tokens;
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
      this.id = this.saved = this.wants_skip = this.tokens = null;
      this.phone = phone;
    }
  },

  deleteCard: function(token, callback){
    var user = this;

    if (!this.id) {
      return;
    }

    $.ajax({
      url: discreet.makeUrl() + 'apps/' + user.id + '/tokens/' + token +
        '?key_id=' + user.key,
      method: 'delete',
      callback: function(){
        callback();
        deleteToken(user, token);
      }
    })
  }
}