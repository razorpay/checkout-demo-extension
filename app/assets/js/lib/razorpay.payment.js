(function(root){

  var card_patterns = {
    mastercard: /^5[0-5]/,
    visa: /^4/,
    maestro16: /^(508125|508126|508159|508192|508227|504437|504681)/,
    maestro: /^(50|63|66|5[6-8]|6[8-9]|600[0-9]|6010|601[2-9]|60[2-9]|61|620|621|6220|6221[0-1])/,
    // maestro: /^(5(018|0[23]|[68])|6(39|7))/,
    unknown: /^(1|2|[7-9])/,
    amex: /^3[47]/,
    diners: /^3[0689]/
    // jcb: /^35/,
    // discover: /^6([045]|22)/
    // rupay: /^(508[5-9][0-9][0-9]|60698[5-9]|60699[0-9]|60738[4-9]|60739[0-9]|607[0-8][0-9][0-9]|6079[0-7][0-9]|60798[0-4]|608[0-4][0-9][0-9]|608500|6521[5-9][0-9]|652[2-9][0-9][0-9]|6530[0-9][0-9]|6531[0-4][0-9]|6070(66|90|32|74|94|27|93|02|76)|6071(26|05|65)|607243)/
  }

  var space_14 = /(.{4})(.{0,6})/;
  var sub_14 = function(match, $1, $2, offset, original){
    $2.length == 6 && ($2 += ' ')
    return $1 + ' ' + $2;
  }

  var card_formats = {
    amex: {
      space: space_14,
      subs: sub_14,
      length: 15
    },
    diners: {
      space: space_14,
      subs: sub_14,
      length: 14
    },
    maestro: {
      space: /[^0-9]/g,
      subs: '',
      length: 19
    },
    unknown: {
      space: /[^0-9]/g,
      subs: '',
      length: 19
    }
  }

  for(var c in card_patterns){
    if(!(c in card_formats)){
      card_formats[c] = {
        space: /(.{4})/g,
        subs: '$1 ',
        length: 16
      }
    }
  }

  var cardType = function(num){
    for(var t in card_patterns){
      if(card_patterns[t].test(num.replace(/[^0-9]/g,'')))
        return t;
    }
    return false;
  }

  var setCaret = function(el, pos){
    if(typeof el.selectionStart == 'number')
      el.selectionStart = el.selectionEnd = pos;
    else {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  var checkSelection = function(el){
    if(typeof el.selectionStart == 'number'){
      if(el.selectionStart != el.selectionEnd) return true;
      return el.selectionStart;
    } else if (document.selection) {
      var range = document.selection.createRange();
      if(range.text){return true};

      // get caret position in IE8
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      return -textInputRange.moveStart('character', -el.value.length);
    }
    return el.value.length;
  }

  var ensureNumeric = function(e){
    if(!e) return '';
    if(e.metaKey || e.ctrlKey || e.which == 13) return false;
    var char = String.fromCharCode(e.which || e.keyCode);
    if(/[0-9]/.test(char)){
      return char;
    }
    e.preventDefault();
    return false;
  }

  var formatExpiry = function(e){
    var char = ensureNumeric(e);
    if(char === false) return;
    
    var pos = checkSelection(this);
    if(pos === true) return;

    var value = this.value;
    var prefix = value.slice(0, pos);
    var prenums = prefix.replace(/[^0-9]/g,'');
    var suffix = value.slice(pos);
    var sufnums = suffix.replace(/[^0-9]/g,'');

    if(pos == 0){
      if(/0|1/.test(char))
        return;
      else
        char = '0' + char;
        pos++;
    }

    if(pos == 1){
      char += ' / ';
    }
    else if(pos == 2){
      char = ' / ' + char;
    }
    else{
      if(!/^(0[1-9]|1[012])($| \/ )($|[0-9]){2}$/.test(prefix + char + suffix))
        e && e.preventDefault();
      if(pos == 6)
        card.filled(this);
      return;
    }
    this.value = (prenums + char + sufnums).slice(0, 7);
    pos = (prefix + char).length;
    setCaret(this, pos);
    e && e.preventDefault();
  }

  var formatExpiryBack = function(e){
    if(e.which != 8) return;
    var el = this;
    var pos = checkSelection(el);
    
    if(pos == 5 && el.value.slice(2, 5) == ' / '){
      e.preventDefault();
      el.value = el.value.slice(0, 2);
    }
  }

  var formatNumber = function(e){
    var char = ensureNumeric(e);
    if(char === false) return;
    
    var pos = checkSelection(this);
    if(pos === true) return;
    
    var value = this.value;
    var prefix = value.slice(0, pos).replace(/[^0-9]/g,'');
    var suffix = value.slice(pos).replace(/[^0-9]/g,'');
    value = prefix + char + suffix;
    
    var type = cardType(value) || 'unknown';
    var cardobj = card_formats[type];

    if(e) e.preventDefault();
    if(prefix.length + suffix.length >= cardobj.length) return;
    pos = prefix.length;

    this.value = value.replace(cardobj.space, cardobj.subs);
    var prespace = prefix.replace(cardobj.space, cardobj.subs).match(/ /g);
    var posdelta = prespace && ++prespace.length || 1;
    pos += posdelta;
    setCaret(this, pos);
    if(value.length == cardobj.length)
      card.filled(this);
  }

  var formatNumberBack = function(e){
    if(e.which != 8) return;

    var el = this;
    var pos = checkSelection(el);
    var val = el.value;
    var len = val.length;
    
    if(pos == len && val[len-1] == ' '){
      e.preventDefault();
      el.value = el.value.slice(0, len-2);
    }
  }

  var card = root.card = {
    luhn: function(num){
      var odd = true;
      var sum = 0;
      var digits = (num + '').split('').reverse();
      
      for(var i=0; i<digits.length; i++){
        var digit = digits[i];
        digit = parseInt(digit, 10);
        if(odd = !odd){
          digit *= 2;
        }
        if(digit > 9){
          digit -= 9;
        }
        sum += digit;
      }
      return sum % 10 === 0;
    },

    formatNumber: function(el){
      if(!el) return;
      card.setType(el, 'unknown');
      $(el).on('keypress', formatNumber);
      $(el).on('keydown', formatNumberBack);
      $(el).on('keyup', function(){
        card.setType(this);
      });
    },

    formatExpiry: function(el){
      if(!el) return;
      $(el).on('keypress', formatExpiry);
      $(el).on('keydown', formatExpiryBack);
    },

    ensureNumeric: function(el){
      if(!el) return;
      $(el).on('keypress', ensureNumeric);
    },

    validateNumber: function(num, type){
      num = (num + '').replace(/\s|-/g,'');
      if(/^[0-9]+$/.test(num)){
        var type = type || cardType(num);
        if(type && card_formats[type].length === num.length){
          return this.luhn(num);
        }
      }
      return false;
    },
    getType: cardType,
    setType: $.noop,
    filled: $.noop
  }

})(Razorpay);