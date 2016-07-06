var CardFormatter, ExpiryFormatter, ContactFormatter;
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
        return /(^.{4}|.{6})/g;
      } else {
        return /(.{4})/g;
      }
    }
  }

  function Formatter(el) {}
  var formatterProto = Formatter.prototype = new EvtHandler();
  formatterProto.init = function(el, options){
    this.el = el;
    this.onfilled = options.onfilled || noop;
    this.on({
      keypress: this.format,
      keydown: bind(function(e){
        if (e.which === 8) {
          this.backHandler(e);
        }
      }, this),
      input: this.oninput,
      change: this.oninput,
      paste: this.oninput
    });
    this.oninput();
  }

  formatterProto.substitute = formatterProto.handler = noop;
  formatterProto.backHandler = function(e) {
    var el = this.el;
    var caretPosition = (getSelection(el)).start;
    var value = el.value;
    if (value.charAt(caretPosition - 1) === ' ') {
      e.preventDefault();
      el.value = value.slice(0, caretPosition - 2) + value.slice(caretPosition);
      setCaret(el, caretPosition - 2);
    }
    this.oninput();
  };

  formatterProto.format = function(e){
    this.handler(getParts(e));
  }

  formatterProto.oninput = function(){
    this.handler(getParts(this.el));
  }

  CardFormatter = function(el, options){
    this.onidentify = options.onidentify || noop;
    this.init(el, options);
  }

  CardFormatter.luhn = function(num) {
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
  }
  CardFormatter.getMaxLen = function(type) {
    return cardLengths[type] || 16;
  }
  CardFormatter.validate = function(number, type) {
    if (CardFormatter.getMaxLen(type) !== number.length) {
      return;
    }
    return CardFormatter.luhn(number);
  }

  var cardFormatterProto = CardFormatter.prototype = new Formatter();

  cardFormatterProto.getType = function(cardNumber) {
    for (var type in cardPatterns) {
      var pattern = cardPatterns[type];
      if (pattern.test(cardNumber.replace(/\ /g, ''))) {
        return type;
      }
    }
    return '';
  }

  cardFormatterProto.substitute = function(value, spacing) {
    return value.replace(spacing, '$1 ').slice(0, this.maxLength);
  }

  cardFormatterProto.handler = function(parts) {
    var el = this.el;
    parts.pre = stripNonDigit(parts.pre);
    parts.val = stripNonDigit(parts.val);
    var newValue = this.value = parts.val;
    var precursor = parts.pre;
    var type = this.getType(newValue);
    if(type !== this.type){
      this.type = type;
      this.onidentify(type);
    }
    var maxLen = CardFormatter.getMaxLen(type);
    var spacing = getCardSpacing(maxLen);

    var caretPosition;
    if (spacing) {
      newValue = this.substitute(newValue, spacing);
      if (parts.val.length >= maxLen) {
        newValue = newValue.replace(/\ $/, '');
      }
      caretPosition = this.substitute(precursor, spacing).length;
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
  }

  ExpiryFormatter = function(el, options){
    this.maxLength = 7;
    this.init(el, options);
  }
  var expiryFormatterProto = ExpiryFormatter.prototype = new Formatter();

  expiryFormatterProto.substitute = function(value){
    return value.replace(/(.{2})/, '$1 / ').slice(0, this.maxLength);
  }
  expiryFormatterProto.handler = function(parts) {
    var el = this.el;
    var pre = stripNonDigit(parts.pre);
    var val = stripNonDigit(parts.val);
    if (/^[2-9]$/.test(val)) {
      pre = val = 0 + val;
    } else if (/^1[3-9]$/.test(val)) {
      return;
    }
    el.value = this.substitute(val);
    pre = this.substitute(pre);
    if(pre.length === this.maxLength){
      this.onfilled(el);
    }
    setCaret(el, pre.length);
  };
  expiryFormatterProto.backHandler = function(e) {
    if ((getSelection(this.el)).start === 5) {
      this.el.value = this.el.value.charAt(0);
      return e.preventDefault();
    }
  };

  ContactFormatter = function(el) {
    this.init(el, emo);
  }
  var contactFormatterProto = ContactFormatter.prototype = new Formatter();
  contactFormatterProto.substitute = function(value) {
    if (value.slice(0, 2) === '91') {
      return '91 ' + value.slice(2).replace(/(.{5})/, '$1 ');
    }
    return value.replace(/^(1|7|2[0,7]|3[0-4,6,9]|4[0,1,3-9]|5[1-8]|6[0-6]|8[1,2,4,6]|9[0-5,8])/, '$1 ');
  }
  contactFormatterProto.handler = function(parts) {
    var el = this.el;
    el.value = this.substitute(stripNonDigit(parts.val));
    setCaret(el, this.substitute(stripNonDigit(parts.pre)).length);
  }
})();