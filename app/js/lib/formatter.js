var Formatter;

!function(){
  var noop = function(value) { return value }

  Formatter = function(el, handlers) {
    this.el = el;
    for (var i in handlers) {
      this[i] = handlers[i];
    }
  }

  var proto = Formatter.prototype = new Eventer;
  proto.backFormat = function(e) {
    if (whichKey(e) !== 8) {
      return;
    }

    var caret = this.getCaret();
    var value = this.el.value;

    if (caret.start && caret.start === caret.end) {
      caret.start -= 1;
    }

    var left = value.slice(0, caret.start);

    this.run({
      e: e,
      left: left,
      value: left + value.slice(caret.end),
      trim: true
    })
  }

  proto.pretty = proto.raw = proto.oninput = noop;
  proto.prettyValue = proto.rawValue = '';

  proto.format = function(e) {
    var caret = this.getCaret();
    var value = this.el.value;
    var left = value.slice(0, caret.start) + getChar(e);
    var value = left + value.slice(caret.end);

    this.run({
      e: e,
      left: left,
      value: value,
      trim: value.length <= this.prettyValue.length
    })
  }

  proto.bind = function() {
    this.evtHandler = new EvtHandler(this.el, this)
      .on({
        keypress: this.format,
        input: this.format,
        keydown: this.backFormat
      })
  }

  proto.unbind = function() {
    var evtHandler = this.evtHandler;
    if (evtHandler) {
      evtHandler.off();
      this.evtHandler = null;
    }
    this._events = {};
  }

  proto.run = function(values) {
    var rawValue = this.raw(values.value);
    if (rawValue !== this.rawValue) {
      this.rawValue = rawValue;
      this.oninput(rawValue);
    }
    var pretty = this.pretty(rawValue, values.trim);
    if (pretty !== values.value) {
      prevent(values.e);
      this.el.value = pretty;
      this.moveCaret(this.pretty(this.raw(values.left), values.trim).length);
    }
    this.prettyValue = pretty;
  }

  proto.moveCaret = function(position) {
    var el = this.el;
    if (el.selectionStart !== position) {
      el.selectionStart = el.selectionEnd = position;
    }
  }

  proto.getCaret = function() {
    return {
      start: this.el.selectionStart,
      end: this.el.selectionEnd
    }
  }

  function whichKey(e) {
    return (e instanceof Event) && (e.which || e.charCode || e.keyCode);
  }

  function prevent(e) {
    return e && e.preventDefault() && e.stopPropagation();
  }

  function getChar(e) {
    var which = whichKey(e);
    return which
      && !e.ctrlKey 
      && String.fromCharCode(which).replace(/[^\x20-\x7E]/, '')
      || '';
  }
}()