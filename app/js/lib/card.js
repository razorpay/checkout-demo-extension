var Card;
(function(){

  var cardPatterns = {
    maestro16: /^50(81(25|26|59|92)|8227)|4(437|681)/,
    discover: /^6(4[4-9]|5|011(0|9|[234]|7(4|[789])|8[6-9]))/,
    maestro: /^(6|5(0|[6-9]))/,
    mastercard: /^(5[1-5]|2[2-7])/,
    visa: /^4/,
    amex: /^3[47]/,
    diners: /^3[0689]/,
    jcb: /^35/
  };

  var cardLengths = {
    amex: 15,
    diners: 14,
    maestro: 19,
    '': 19
  };

  function getCardSpacing(maxLen) {
    if (maxLen !== 19) {
      if (maxLen < 16) {
        return /(^.{4}|.{6})/;
      } else {
        return /(.{4})/g;
      }
    }
  };

  function CardFormatter(el, options) {
    if (typeof options !== 'object') {
      options = emo;
    }
    this.el = el;
    this.oninput()
    this.type = Card.getCardType(this.value);
    this.onfilled = options.onfilled || noop;
    this.onidentify = options.onidentify || noop;

    var eventListeners = {
      keypress: this.format,
      keydown: this.formatBack,
      input: this.oninput,
      change: this.oninput,
      paste: this.oninput
    };

    this.on(eventListeners);
    return this;
  };

  CardFormatter.prototype = new EvtHandler;

  CardFormatter.prototype.substitute = function(value, spacing) {
    return value.replace(spacing, '$1 ').slice(0, this.maxLength);
  }

  CardFormatter.prototype.format = function(e) {
    this.input(getParts(e));
  };

  CardFormatter.prototype.oninput = function(e) {
    this.input(getParts(this.el));
  };

  CardFormatter.prototype.input = function(parts) {
    var el = this.el;
    parts.pre = stripNonDigit(parts.pre);
    parts.val = stripNonDigit(parts.val);
    var newValue = this.value = parts.val;
    var precursor = parts.pre;
    var type = Card.getCardType(newValue);
    if(type !== this.type){
      this.type = type;
      invoke('onidentify', this, type);
    }
    var maxLen = Card.getLength(this.type);
    var spacing = getCardSpacing(maxLen);

    if (spacing) {
      newValue = this.substitute(newValue, spacing);
      if (parts.val.length >= maxLen) {
        newValue = newValue.replace(/\ $/, '');
      }
      var caretPosition = this.substitute(precursor, spacing).length;
      if (caretPosition > newValue.length) {
        caretPosition = newValue.length;
      }
    } else {
      caretPosition = precursor.length;
    }

    el.value = newValue;
    setCaret(el, caretPosition);
    if (precursor.length === maxLen) {
      this.onfilled(el);
    }
  };

  CardFormatter.prototype.formatBack = function(e) {
    var caretPosition, el, value;
    if (e.which !== 8) {
      return;
    }
    el = this.el;
    caretPosition = (getSelection(el)).start;
    value = el.value;
    if (' ' === value.charAt(caretPosition - 1)) {
      e.preventDefault();
      el.value = value.slice(0, caretPosition - 2) + value.slice(caretPosition);
      setCaret(el, caretPosition - 2);
      return this.oninput();
    }
  };

  function ExpiryFormatter(el, options) {
    if (typeof options !== 'object') {
      options = emo;
    }
    this.maxLength = 7;
    this.el = el;
    this.onfilled = options.onfilled || noop;
    var eventListeners = {
      keypress: this.format,
      keydown: this.formatBack,
      input: this.oninput,
      change: this.oninput,
      paste: this.oninput
    };
    this.on(eventListeners);
  };

  ExpiryFormatter.prototype = new EvtHandler;

  ExpiryFormatter.prototype.substitute = function(value){
    return value.replace(/(.{2})/, '$1 / ').slice(0, this.maxLength);
  }

  ExpiryFormatter.prototype.input = function(parts) {
    var el = this.el;
    parts.pre = stripNonDigit(parts.pre);
    parts.val = stripNonDigit(parts.val);
    var precursor = parts.pre;
    var value = parts.val;
    if (/^[2-9]$/.test(value)) {
      precursor = value = 0 + value;
    } else if (/^1[3-9]$/.test(value)) {
      return;
    }
    el.value = this.substitute(value);
    precursor = this.substitute(precursor);
    if(precursor.length === this.maxLength){
      this.onfilled(el);
    }
    setCaret(el, precursor.length);
  };

  ExpiryFormatter.prototype.format = function(e) {
    this.input(getParts(e));
  };

  ExpiryFormatter.prototype.oninput = function(e) {
    this.input(getParts(this.el));
  };

  ExpiryFormatter.prototype.formatBack = function(e) {
    if (e.which !== 8) {
      return;
    }
    if ((getSelection(this.el)).start === 5) {
      this.el.value = this.el.value.charAt(0);
      return e.preventDefault();
    }
  };

  Card = function() {
    this.fields = [];
  };

  Card.prototype = {
    numberField: function(el, options) {
      this.fields.push(new CardFormatter(el, options));
    },
    expiryField: function(el, options){
      this.fields.push(new ExpiryFormatter(el, options));
    }
  }

  Card.getCardType = function(cardNumber) {
    for (var type in cardPatterns) {
      var pattern = cardPatterns[type];
      if (pattern.test(cardNumber.replace(/\ /g, ''))) {
        return type;
      }
    }
    return '';
  };

  Card.luhn = function(num) {
    var odd = true;
    var sum = 0;
    var digits = (num + '').split('').reverse();
    for (var i = 0; i < digits.length; i++) {
      var digit = digits[i];
      digit = parseInt(digit, 10);
      if ((odd = !odd)) {
        digit *= 2;
      }
      if (digit > 9) {
        digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  Card.getLength = function(type){
    return cardLengths[type] || 16;
  },

  Card.validateCardNumber = function(number, type) {
    number = String(number).replace(/\ /g, '');
    if (!/\D/.test(number)) {
      if (!type) {
        type = Card.getCardType(number);
      }
      if (type) {
        if (Card.getLength(type) !== number.length) {
          return;
        }
      }
      return Card.luhn(number);
    }
    return false;
  };

})();