var Formatter;

(function() {
  var noop = function(value) {
    return value;
  };

  Formatter = function(el, handlers, noBind) {
    Eventer.call(this);
    this.el = el;

    if (typeof handlers === 'string') {
      handlers = Formatter.rules[handlers];
    }

    if (!handlers || !(el instanceof Element)) {
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
  };

  Formatter.events = {
    keypress: 'fwdFormat',
    input: 'deferFormat',
    change: 'format',
    blur: 'format',
    keydown: 'backFormat'
  };

  var proto = (Formatter.prototype = new Eventer());

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
    });
  };

  proto.pretty = proto.isValid = noop;
  proto.prettyValue = '';

  proto.raw = function(value) {
    return value.replace(/\D/g, '');
  };

  proto.setValue = function(value) {
    this.value = value;
  };

  proto.oninput = function() {
    this.emit('change');
  };

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
    });
  };

  proto.deferFormat = function(e) {
    invoke('format', this, e, 0);
  };

  proto.format = function(e) {
    var caretPosition = this.getCaret().start;
    var value = this.el.value;

    this.run({
      value: value,
      left: value.slice(0, caretPosition)
    });
  };

  proto.bind = function() {
    this.evtHandler = new EvtHandler(this.el, this).on(Formatter.events);
    return this;
  };

  proto.unbind = function() {
    var evtHandler = this.evtHandler;
    if (evtHandler) {
      evtHandler.off();
      this.evtHandler = null;
    }
    this._events = {};
    return this;
  };

  proto.run = function(values) {
    // domValue is would-be value, if not prevented (keypress, keydown)
    //    we prevent all the time in that case
    //    for events with non-preventable character printing,
    //    it is actual current value (input, change, blur)
    var domValue = values.value;
    var rawValue = this.raw(domValue);

    // save for later use, to compare if it was changed
    var oldValue = this.value;
    this.setValue(rawValue);

    // left is substring of domValue, but leftwards of caret position
    var left = values.left;
    var caretPosition = left.length;

    // trim whitespaces/insignificant characters if cursor has moved leftwards
    var shouldTrim = caretPosition < this.caretPosition;
    var pretty = this.pretty(this.value, shouldTrim);

    var shouldUpdateDOM;
    if (values.e) {
      // iphone: character-in-waiting is not printed if input is blurred synchronously.
      //    prevent by default all the time and set value manually.
      //    this takes effect for keypress, keydown events
      preventDefault(values.e);

      // check if value was changed at all
      shouldUpdateDOM = pretty !== this.prettyValue;
    } else {
      // for non-preventable events, check if current value is correct
      shouldUpdateDOM = pretty !== domValue;
    }

    this.prettyValue = pretty;
    if (shouldUpdateDOM) {
      this.el.value = pretty;
    }

    // move caret only if cursor is not at rightmost end.
    // checking for shouldUpdateDOM because just setting el.value
    //    might not update the caret position automatically, e.g. IE9
    if (left !== pretty || shouldUpdateDOM) {
      // example where shouldUpdateDOM is false but first condition is true:
      // inserting character "4" at any position in "4444 4444 4444 4444"
      //    that doesnt require dom value change, but does require caret to be moved
      caretPosition = this.pretty(this.raw(left), shouldTrim).length;
      if (isWP) {
        // following is necessary, else caret only blinks at intended position.
        //    but its at the rightmost position in effect
        invoke('moveCaret', this, caretPosition, 0);
      } else {
        this.moveCaret(caretPosition);
      }
    } // else caretPosition is already pretty.length

    this.caretPosition = caretPosition;

    if (oldValue !== this.value) {
      this.oninput();
    }
  };

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
  };

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
    } catch (e) {}

    if (!isNumber(caretPosition)) {
      caretPosition = caretEnd = length;
    }
    return {
      start: caretPosition,
      end: caretEnd
    };
  };

  function whichKey(e) {
    return e instanceof Event && (e.which || e.charCode || e.keyCode);
  }

  function getChar(e) {
    var which = whichKey(e);
    return (
      (which &&
        !e.ctrlKey &&
        String.fromCharCode(which).replace(/[^\x20-\x7E]/, '')) ||
      ''
    );
  }
})();
