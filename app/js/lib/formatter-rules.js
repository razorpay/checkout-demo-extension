function getDecimalAmount(amount) {
  return (amount / 100).toFixed(2).replace('.00', '');
}

(function() {
  var cardPatterns = {
    visa: /^4/,
    mastercard: /^(5[1-5]|2[2-7])/,
    maestro16: /^50(81(25|26|59|92)|8227)|4(437|681)/,
    amex: /^3[47]/,

    // keep more specific rupay above catchall maestro
    rupay: /^(508[5-9]|60(80(0|)[^0]|8[1-4]|8500|698[5-9]|699|7[^9]|79[0-7]|798[0-4])|65(2(1[5-9]|[2-9])|30|31[0-4])|817[2-9]|81[89]|820[01])/,
    discover: /^(65[1,3-9]|6011)/,
    maestro: /^(6|5(0|[6-9])).{5}/,
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
      setValue: function(value) {
        var currentType = (this.currentType = getType(value));

        if (currentType !== this.type) {
          this.maxLen = getMaxLen(currentType);
        }
        this.value = value.slice(0, this.maxLen);
      },

      pretty: function(value, shouldTrim) {
        var len = this.maxLen;
        var prettyValue = value
          .slice(0, len)
          .replace(getCardSpacing(len), '$1 ');
        if (shouldTrim || value.length >= len) {
          prettyValue = prettyValue.trim();
        }
        return prettyValue;
      },

      oninput: function() {
        var o = {
          type: this.currentType,
          maxLen: this.maxLen,
          valid: this.isValid()
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
        if (!luhnCheck(value)) {
          return;
        }
        if (this.type === 'maestro' && value.length === 16) {
          return true;
        }
        return value.length === this.maxLen;
      }
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
          valid: this.isValid()
        });
      },

      isValid: function() {
        if (this.value.length === 4) {
          var yearValue = parseInt(this.value.slice(2), 10);
          var currentTime = new Date();
          var currentYear = currentTime.getFullYear() - 2000;
          if (currentYear === yearValue) {
            return (
              parseInt(this.value.slice(0, 2), 10) >= currentTime.getMonth()
            );
          }
          return yearValue > currentYear;
        }
      }
    },

    number: {
      raw: function(value) {
        var returnVal = value.replace(/\D/g, '');
        if (this.el.maxLength) {
          returnVal = returnVal.slice(0, this.el.maxLength);
        }
        return returnVal;
      }
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

      pretty: function(value) {
        return value;
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
  };
})();
