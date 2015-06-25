/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;
  Razorpay = new Razorpay(options);

  Razorpay.payment = {
    authorize: function(data){
      Razorpay.submit(data);
    },
    getMethods: function(callback){
      return Razorpay.getMethods(callback);
    },
    validate: function(data){
      return Razorpay.validateData(data);
    }
  }
})();
