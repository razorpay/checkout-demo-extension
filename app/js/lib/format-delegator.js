var FormatDelegator;

(function() {
  FormatDelegator = function(el) {
    if (!(this instanceof FormatDelegator)) {
      return new FormatDelegator(el);
    }
    EvtHandler.call(this, el);
    this.bits = [];

    each(
      Formatter.events,
      function(event, fn) {
        this.on(
          event,
          function(e) {
            var formatter = e.target._formatter;
            if (formatter) {
              formatter[fn](e);
            }
          },
          el,
          true
        );
      },
      this
    );
  };

  var proto = (FormatDelegator.prototype = new EvtHandler());

  proto.add = function(ruleType, el) {
    if (Formatter.rules[ruleType]) {
      var formatter = new Formatter(el, ruleType, true);
      this.bits.push(formatter);
      return formatter;
    }
  };

  proto.destroy = function() {
    this.off();
    for (var bit in this.bits) {
      this.bits[bit].unbind();
    }
    this.bits = [];
  };
})();
