var FormatDelegator;

!function() {
  FormatDelegator = function(el) {
    EvtHandler.call(this, el);
    this.bits = [];

    var events = Formatter.events;
    for (var event in events) {
      this.on(event, function(e) {
        var formatter = e.target._formatter;
        if (formatter) {
          formatter[events[e.type]](e);
        }
      }, el, true);
    }
  }

  var proto = FormatDelegator.prototype = new EvtHandler;

  proto.add = function(ruleType, el) {
    if (Formatter.rules[ruleType]) {
      var formatter = new Formatter(el, ruleType, true);
      this.bits.push(formatter);
      return formatter;
    }
  }

  proto.destroy = function() {
    this.off();
    for (var bit in this.bits) {
      this.bits[bit].unbind();
    }
    this.bits = [];
  }
}()