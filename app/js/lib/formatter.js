var Formatter;

(function(){
  var noop = function(value) { return value }

  Formatter = function(el, handlers, noBind) {
    Eventer.call(this);
    this.el = el;

    if (typeof handlers === 'string') {
      handlers = Formatter.rules[handlers];
    }

    if (!handlers || !(el instanceof Node)) {
      return false;
    } else {
      for (var i in handlers) {
        this[i] = handlers[i];
      }
    }

    if (noBind) {
      el._formatter = this;
    } else {
      this.bind();
    }
    // set initial formatting
    this.format();
  }

  Formatter.events = {
    keypress: 'format',
    input: 'format',
    keydown: 'backFormat'
  }

  var proto = Formatter.prototype = new Eventer();

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

  proto.pretty = proto.raw = noop;
  proto.prettyValue = proto.value = '';

  proto.oninput = function() {
    this.emit('change');
  }

  proto.format = function(e) {
    var caret = this.getCaret();
    var value = this.el.value;
    var left = value.slice(0, caret.start) + getChar(e);
    value = left + value.slice(caret.end);

    this.run({
      e: e,
      left: left,
      value: value,
      trim: value.length <= this.prettyValue.length
    })
  }

  proto.bind = function() {
    this.evtHandler = new EvtHandler(this.el, this)
      .on(Formatter.events)
    return this;
  }

  proto.unbind = function() {
    var evtHandler = this.evtHandler;
    if (evtHandler) {
      evtHandler.off();
      this.evtHandler = null;
    }
    this._events = {};
    return this;
  }

  proto.run = function(values) {
    var rawValue = this.raw(values.value);
    if (rawValue !== this.value) {
      this.value = rawValue;
      this.oninput();
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
    if (isNumber(el.selectionStart)) {
      if (el.selectionStart !== position) {
        el.selectionStart = el.selectionEnd = position;
      }
    } else {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', position);
      range.moveStart('character', position);
      range.select();
    }
  }

  proto.getCaret = function() {
    var el = this.el;
    var value = el.value;
    var length = value.length;
    var caretPosition = el.selectionStart;
    var caretEnd;
    var text = '';
    if (isNumber(caretPosition)) {
      caretEnd = el.selectionEnd;
    } else if (document.selection) {
      var range = document.selection.createRange();
      text = range.text;
      var textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      caretPosition = -textInputRange.moveStart('character', -length);
      caretEnd = caretPosition + text.length;
    }
    return {
      start: caretPosition,
      end: caretEnd
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
})();
