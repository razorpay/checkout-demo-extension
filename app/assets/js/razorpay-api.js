/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;

  Razorpay.configure = function(options){
    discreet.rzp = new Razorpay(options);
  }

  Razorpay.payment = {
    authorize: function(data){
      discreet.rzp.submit(data);
    },
    getMethods: function(callback){
      return discreet.rzp.getMethods(callback);
    },
    validate: function(data){
      return discreet.rzp.validateData(data);
    }
  }
})();
