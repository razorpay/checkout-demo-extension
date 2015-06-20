Razorpay.prototype.$ = {
  noop: function(){},
  extend: function(target, source){
    for(o in source){
      target[o] = source[o]
    }
    return target
  }
};