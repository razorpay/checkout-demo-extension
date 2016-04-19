function User (o) {
  this.phone = o.phone || '';
  this.email = o.email || '';
  this.logged_in = o.logged_in || null;
  this.saved = o.saved || null;
  this.wants_skip = o.wants_skip || null;
}

User.prototype = {
  lookup: function(callback){
    var user = this;
    $.ajax({
      url: discreet.makeUrl() + this.phone,
      data: {
        key: this.key
      },
      callback: function(data){
        user.saved = true//!!data.saved;
        callback();
      }
    })
  },

  login: function(){
    $.ajax({
      url: discreet.makeUrl() + 'otp/create',
      data: {
        contact: this.phone,
        key: this.key
      }
    })
  },

  verify: function(otp, callback){
    var user = this;
    $.ajax({
      url: discreet.makeUrl() + 'otp/verify',
      data: {
        contact: this.phone,
        key: this.key,
        otp: otp
      },
      callback: function(data){
        user.logged_in = user.saved = true//!!data.success;
        callback();
      }
    })
  },

  setPhone: function(phone){
    if (this.phone !== phone) {
      this.logged_in = this.saved = this.wants_skip = null;
      this.phone = phone;
    }
  }
}