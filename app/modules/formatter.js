import * as Card from 'common/card';

const alphanumericRaw = function(value) {
  var returnVal = value.replace(/[^a-zA-Z0-9]/g, '');

  if (this.el.maxLength > 0) {
    returnVal = _Str.slice(returnVal, 0, this.el.maxLength);
  }

  return returnVal;
};

export const Formatter = function(el, handlers, noBind) {
  Eventer.call(this);
  this.el = el;

  if (_.isString(handlers)) {
    handlers = Formatter.rules[handlers];
  }

  if (!handlers || !_.isElement(el)) {
    return false;
  } else {
    _Obj.loop(handlers, (val, key) => {
      this[key] = handlers[key];
    });
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
  keydown: 'backFormat',
};

Formatter.rules = {
  card: {
    setValue: function(value) {
      let currentType = (this.currentType = Card.getCardType(value));

      if (currentType !== this.type) {
        this.maxLen = Card.getCardMaxLen(currentType);
      }
      this.value = _Str.slice(value, 0, this.maxLen);
    },

    pretty: function(value, shouldTrim) {
      let len = this.maxLen;
      let prettyValue = value
        .slice(0, len)
        .replace(Card.getCardSpacing(len), '$1 ');
      if (shouldTrim || value.length >= len) {
        prettyValue = prettyValue.trim();
      }
      return prettyValue;
    },

    oninput: function() {
      let o = {
        type: this.currentType,
        maxLen: this.maxLen,
        valid: this.isValid(),
      };
      if (o.type !== this.type) {
        this.type = o.type;
        this.emit('network', o);
      }
      this.emit('change', o);
    },

    isValid: function(value) {
      if (!value) {
        value = this.value;
      }
      if (!Card.luhnCheck(value)) {
        return;
      }
      if (this.type === 'maestro' && value.length === 16) {
        return true;
      }
      return value.length === this.maxLen;
    },
  },

  alphanumeric: {
    raw: alphanumericRaw,
  },

  aadhaar: {
    pretty: function(value, shouldTrim) {
      let len = 16;
      let prettyValue = value.slice(0, len).replace(/(.{4})/g, '$1 ');
      if (shouldTrim || value.length >= len) {
        prettyValue = prettyValue.trim();
      }
      return prettyValue;
    },
  },

  ifsc: {
    raw: alphanumericRaw,
    pretty: function(value, shouldTrim) {
      let len = 11;
      let prettyValue = value.slice(0, len).toUpperCase();
      if (shouldTrim || value.length >= len) {
        prettyValue = prettyValue.trim();
      }
      return prettyValue;
    },
    isValid: function() {
      if (this.value.length === 11) {
        return /^[a-zA-Z]{4}[a-zA-Z0-9]{7}$/.test(this.value);
      }
      return false;
    },
  },

  expiry: {
    pretty: function(value, shouldTrim) {
      value = value
        .replace(/^([2-9])$/, '0$1')
        .replace(/^1[3-9]$/, '1')
        .replace(/(.{2})/, '$1 / ')
        .slice(0, 7);

      if (shouldTrim) {
        value = value.replace(/\D+$/, '');
      }
      return value;
    },

    oninput: function() {
      this.emit('change', {
        valid: this.isValid(),
      });
    },

    isValid: function() {
      if (this.value.length === 4) {
        let yearValue = parseInt(this.value.slice(2), 10);
        let currentTime = new Date();
        let currentYear = currentTime.getFullYear() - 2000;
        if (currentYear === yearValue) {
          return parseInt(this.value.slice(0, 2), 10) >= currentTime.getMonth();
        }
        return yearValue > currentYear;
      }
    },
  },

  number: {
    raw: function(value) {
      let returnVal = value.replace(/\D/g, '');
      if (this.el.maxLength) {
        returnVal = _Str.slice(returnVal, 0, this.el.maxLength);
      }
      return returnVal;
    },
  },

  amount: {
    raw: function(value) {
      return value
        .split('.')
        .slice(0, 2)
        .map(function(v, index) {
          v = v.replace(/\D/g, '');
          if (index) {
            v = v.slice(0, 2);
          }
          return v;
        })
        .join('.');
    },

    pretty: _Func.noop,
  },

  phone: {
    raw: function(value) {
      let returnVal = value.slice(0, 15).replace(/\D/g, '');
      if (value[0] === '+') {
        returnVal = '+' + returnVal;
      }
      return returnVal;
    },
  },
};

let formatterProto = (Formatter.prototype = new Eventer());

formatterProto.backFormat = function(e) {
  // windows phone: if keydown is prevented, and value is changed synchronously,
  //    it ignores one subsequent input event.
  //    hence no back formatting in WP
  if (isWP || _.getKeyFromEvent(e) !== 8) {
    return;
  }

  let caret = this.getCaret();
  let value = this.el.value;

  if (caret.start && caret.start === caret.end) {
    caret.start -= 1;
  }

  let left = _Str.slice(value, 0, caret.start);

  this.run({
    e: e,
    left: left,
    value: left + _Str.sliceFrom(value, caret.end),
  });
};

formatterProto.pretty = formatterProto.isValid = _Func.noop;
formatterProto.prettyValue = '';

formatterProto.raw = value => value.replace(/\D/g, '');

formatterProto.setValue = function(value) {
  this.value = value;
};

formatterProto.oninput = function() {
  this.emit('change');
};

formatterProto.fwdFormat = function(e) {
  let newChar = _.getCharFromEvent(e);
  if (!newChar) {
    return;
  }
  let caret = this.getCaret();
  let value = this.el.value;
  let left = _Str.slice(value, 0, caret.start) + newChar;
  value = left + _Str.sliceFrom(value, caret.end);

  this.run({
    e: e,
    left: left,
    value: value,
  });
};

formatterProto.deferFormat = function(e) {
  invoke('format', this, e, 0);
};

formatterProto.format = function(e) {
  let caretPosition = this.getCaret().start;
  let value = this.el.value;

  this.run({
    value: value,
    left: _Str.slice(value, 0, caretPosition),
  });
};

formatterProto.bind = function() {
  this.evtHandler = new EvtHandler(this.el, this).on(Formatter.events);
  return this;
};

formatterProto.unbind = function() {
  let evtHandler = this.evtHandler;
  if (evtHandler) {
    evtHandler.off();
    this.evtHandler = null;
  }
  this._events = {};
  return this;
};

formatterProto.run = function(values) {
  // domValue is would-be value, if not prevented (keypress, keydown)
  //    we prevent all the time in that case
  //    for events with non-preventable character printing,
  //    it is actual current value (input, change, blur)
  let domValue = values.value;
  let rawValue = this.raw(domValue);

  // save for later use, to compare if it was changed
  let oldValue = this.value;
  this.setValue(rawValue);

  // left is substring of domValue, but leftwards of caret position
  let left = values.left;
  let caretPosition = left.length;

  // trim whitespaces/insignificant characters if cursor has moved leftwards
  var shouldTrim = caretPosition < this.caretPosition;
  var pretty = this.pretty(this.value, shouldTrim);

  let shouldUpdateDOM;
  if (values.e) {
    // iphone: character-in-waiting is not printed if input is blurred synchronously.
    //    prevent by default all the time and set value manually.
    //    this takes effect for keypress, keydown events

    _Doc.preventEvent(values.e);

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

formatterProto.moveCaret = function(position) {
  // console.log('moveCaret ' + position);
  let el = this.el;
  if (_.isNumber(el.selectionStart)) {
    if (el.selectionStart !== position) {
      el.selectionStart = el.selectionEnd = position;
    }
  } else {
    let range = el.createTextRange();
    range.collapse(true);
    range.moveEnd('character', position);
    range.moveStart('character', position);
    range.select();
  }
};

formatterProto.getCaret = function() {
  let el = this.el;
  let value = el.value;
  let length = value.length;
  let text = '';
  let caretPosition, caretEnd;

  try {
    caretPosition = el.selectionStart;
    if (_.isNumber(caretPosition)) {
      caretEnd = el.selectionEnd;
    } else if (document.selection) {
      let range = document.selection.createRange();
      text = range.text;
      let textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      caretPosition = -textInputRange.moveStart('character', -length);
      caretEnd = caretPosition + text.length;
    }
  } catch (e) {}

  if (!_.isNumber(caretPosition)) {
    caretPosition = caretEnd = length;
  }
  return {
    start: caretPosition,
    end: caretEnd,
  };
};

export const FormatDelegator = function(el) {
  if (!_.is(this, FormatDelegator)) {
    return new FormatDelegator(el);
  }

  EvtHandler.call(this, el);
  this.bits = [];

  _Obj.loop(Formatter.events, (fn, evt) => {
    this.on(
      evt,
      e => {
        let formatter = e.target._formatter;
        if (formatter) {
          formatter[fn](e);
        }
      },
      el,
      true
    );
  });
};

let formatDelegatorProto = (FormatDelegator.prototype = new EvtHandler());

formatDelegatorProto.add = function(ruleType, el) {
  if (Formatter.rules[ruleType]) {
    let formatter = new Formatter(el, ruleType, true);
    this.bits.push(formatter);
    return formatter;
  }
};

formatDelegatorProto.destroy = function() {
  this.off();
  _Arr.loop(this.bits, bit => {
    this.bits[bit].unbind();
  });
  this.bits = [];
};
