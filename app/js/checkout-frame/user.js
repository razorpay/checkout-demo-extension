function User (o, key) {
  this.id = o.id || null;
  this.phone = o.phone || '';
  this.saved = o.saved || null;
  this.wants_skip = o.wants_skip || null;
  this.tokens = o.tokens || null;
  this.key = key;
}

User.prototype = {
  lookup: function(callback){
    var user = this;
    $.ajax({
      url: makeAuthUrl(this, 'customer/status/' + this.phone),
      callback: function(data){
        user.saved = !!data.saved;
        invoke(callback, null, data, 600);
      }
    })
  },

  login: function(){
    $.post({
      url: makeAuthUrl(this, 'otp/create'),
      data: {
        contact: this.phone
      }
    })
  },

  verify: function(otp, callback){
    var user = this;
    $.post({
      url: makeAuthUrl(this, 'otp/verify'),
      data: {
        contact: this.phone,
        otp: otp
      },
      callback: function(data){
        user.id = data.app_id;
        user.tokens = data.tokens;
        callback();
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
    if (!this.id) {
      return;
    }
    $.ajax({
      url: makeAuthUrl(this, 'apps/' + this.id + '/tokens/' + token),
      method: 'delete',
      callback: function(){
        callback();
      }
    })
  }
}