Razorpay::$ =
  noop: ()->
  extend: (target, source)->
    for o,s of source
      target[o] = s
    target