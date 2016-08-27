var FormatDelegator;

!function() {
  FormatDelegator = function(el, elements) {
    EvtHandler.call(this, el);
    this.bits = [];

    for (var ruleType in elements) {
      if (Formatter.rules[ruleType]) {
        this[ruleType] = new Formatter(elements[ruleType], ruleType, true);
        this.bits.push(this[ruleType]);
      }
    }

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

  proto.destroy = function() {
    this.off();
    for (var bit in this.bits) {
      this.bits[bit].unbind();
    }
    this.bits = [];
  }
}()