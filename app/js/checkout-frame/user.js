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
      url: discreet.makeUrl() + 'customer/status/' + this.phone + '?key_id=' + this.key,
      callback: function(data){
        user.saved = !!data.saved;
        invoke(callback, null, data, 600);
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
      url: discreet.makeUrl() + 'apps/' + this.id + '/tokens/' + token +
        '?key_id=' + this.key,
      method: 'delete',
      callback: function(){
        callback();
      }
    })
  }
}