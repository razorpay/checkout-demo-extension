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
    defer(bind('format', this));
  }

  Formatter.events = {
    // keypress: 'fwdFormat',
    input: 'format',
    // change: 'format',
    // blur: 'format',
    // keydown: 'backFormat'
  }

  var proto = Formatter.prototype = new Eventer();

  proto.backFormat = function(e) {
    // windows phone: if keydown is prevented, and value is changed synchronously,
    //    it ignores one subsequent input event.
    //    hence no back formatting in WP
    if (isWP || whichKey(e) !== 8) {
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
      value: left + value.slice(caret.end)
    })
  }

  proto.pretty = noop;
  proto.prettyValue = '';

  proto.raw = function(value) {
    return value.replace(/\D/g, '')
  }

  proto.setValue = function(value) {
    this.value = value;
  }

  proto.oninput = function() {
    this.emit('change');
  }

  proto.fwdFormat = function(e) {
    var newChar = getChar(e);
    if (!newChar) {
      return;
    }
    var caret = this.getCaret();
    var value = this.el.value;
    var left = value.slice(0, caret.start) + newChar;
    value = left + value.slice(caret.end);

    this.run({
      e: e,
      left: left,
      value: value
    })
  }

  proto.format = function(e) {
    var caretPosition = this.getCaret().start;
    var value = this.el.value;

    this.run({
      value: value,
      left: value.slice(0, caretPosition)
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

    var oldValue = this.value;
    this.setValue(rawValue);

    var left = values.left;
    var caretPos = left.length;

    // trim whitespaces/insignificant characters if cursor moved leftwards
    var shouldTrim = caretPos < this.caretPos;
    var pretty = this.pretty(this.value, shouldTrim);

    // iphone: character-in-waiting is not printed if input is blurred synchronously.
    //    prevent by default all the time and set value manually.
    preventDefault(values.e);

    if (shouldTrim || pretty !== this.prettyValue) {
      this.prettyValue = pretty;
      this.el.value = pretty;
    }

    caretPos = this.pretty(this.raw(left), shouldTrim).length;
    this.caretPos = caretPos;
    this.moveCaret(caretPos);

    if (oldValue !== this.value) {
      // this.oninput();
    }
  }

  proto.moveCaret = function(position) {
    // console.log('moveCaret ' + position);
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
    var text = '';
    var caretPosition, caretEnd;

    try {
      caretPosition = el.selectionStart;
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
    } catch(e) {}

    if (!isNumber(caretPosition)) {
      caretPosition = caretEnd = length;
    }
    return {
      start: caretPosition,
      end: caretEnd
    }
  }

  function whichKey(e) {
    return (e instanceof Event) && (e.which || e.charCode || e.keyCode);
  }

  function getChar(e) {
    var which = whichKey(e);
    return which
      && !e.ctrlKey 
      && String.fromCharCode(which).replace(/[^\x20-\x7E]/, '')
      || '';
  }
})();
