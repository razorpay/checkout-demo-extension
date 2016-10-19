(function(){

  var cardPatterns = {
    visa: /^4/,
    mastercard: /^(5[1-5]|2[2-7])/,
    maestro16: /^50(81(25|26|59|92)|8227)|4(437|681)/,
    amex: /^3[47]/,

    // keep more specific rupay above catchall maestro
    rupay: /^(508[5-9][0-9][0-9]|60698[5-9]|60699[0-9]|60738[4-9]|60739[0-9]|607[0-8][0-9][0-9]|6079[0-7][0-9]|60798[0-4]|608[0-4][0-9][0-9]|608500|6521[5-9][0-9]|652[2-9][0-9][0-9]|6530[0-9][0-9]|6531[0-4][0-9]|6070(66|90|32|74|94|27|93|02|76)|6071(26|05|65)|607243)[0-9]/,
    maestro: /^(6|5(0|[6-9]))/,
    discover: /^6(4[4-9]|5|011(0|9|[234]|7(4|[789])|8[6-9]))/,
    diners: /^3[0689]/,
    jcb: /^35/
  };

  var cardLengths = {
    amex: 15,
    diners: 14,
    maestro: 19,
    '': 19
  };

  function getType(cardNumber) {
    for (var type in cardPatterns) {
      var pattern = cardPatterns[type];
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    return '';
  }

  function getMaxLen(type) {
    return cardLengths[type] || 16;
  }

  function getCardSpacing(maxLen) {
    if (maxLen !== 19) {
      if (maxLen < 16) {
        return /(^.{4}|.{6})/g;
      } else {
        return /(.{4})/g;
      }
    }
  }

  function luhnCheck(num) {
    var odd = true;
    var sum = 0;
    var digits = String(num).split('').reverse();
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

  function cardType(value) {
    for (var type in cardPatterns) {
      var pattern = cardPatterns[type];
      if (pattern.test(value)) {
        return type;
      }
    }
    return '';
  }

  Formatter.rules = {
    card: {
      raw: function(value) {
        return value.replace(/\D/g, '');
      },

      pretty: function(value, shouldTrim) {
        var len = this.maxLen || 16;
        var prettyValue = value.slice(0, len).replace(getCardSpacing(len), '$1 ');
        if (shouldTrim || value.length >= len) {
          prettyValue = prettyValue.trim();
        }
        return prettyValue;
      },

      onInput: function() {
        var type = getType(this.value);

        var networkChanged = type !== this.type;
        if (networkChanged) {
          this.maxLen = getMaxLen(type);
        }
        var o = {
          type: type,
          maxLen: this.maxLen,
          valid: this.isValid()
        }
        this.emit('change', o);
        if (networkChanged) {
          this.type = o.type;
          this.emit('network', o);
        }
      },

      isValid: function(value) {
        if (!value) {
          value = this.value;
        }
        return value.length === this.maxLen && luhnCheck(value);
      }
    },

    expiry: {
      raw: function(value) {
        return value.replace(/\D/g, '');
      },

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
          valid: this.isValid()
        });
      },

      isValid: function() {
        if (this.value.length === 4) {
          var yearValue = parseInt(this.value.slice(2), 10);
          var currentTime = new Date();
          var currentYear = currentTime.getYear() - 100;
          if (currentYear === yearValue) {
            return parseInt(this.value.slice(0, 2), 10) >= currentTime.getMonth();
          }
          return yearValue > currentYear;
        }
      }
    },

    number: {
      raw: function(value) {
        return value.replace(/\D/g, '');
      }
    },

    phone: {
      raw: function(value) {
        var returnVal = value.slice(0, 15).replace(/\D/g, '');
        if (value[0] === '+') {
          returnVal = '+' + returnVal;
        }
        return returnVal;
      }
    }
  }
})();