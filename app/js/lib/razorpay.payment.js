var _caPatterns = {
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

var _ca_space_14 = /(.{4})(.{0,6})/;
var _ca_sub_14 = function(match, $1, $2, offset, original){

  if ( $2.length === 6 ){
    $2 += ' ';
  }
  return $1 + ' ' + $2;
}

var _ca_card_formats = {
  amex: {
    space: _ca_space_14,
    subs: _ca_sub_14,
    length: 15
  },
  diners: {
    space: _ca_space_14,
    subs: _ca_sub_14,
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

for(var c in _caPatterns){
  if(!(c in _ca_card_formats)){
    _ca_card_formats[c] = {
      space: /(.{4})/g,
      subs: '$1 ',
      length: 16
    }
  }
}

var _caCardType = function(num){
  for(var t in _caPatterns){
    if(_caPatterns[t].test(num.replace(/[^0-9]/g,'')))
      return t;
  }
  return false;
}

var _caSetCaret = function(el, pos){
  if(navigator.userAgent.indexOf('Android'))
     return;
  if(typeof el.selectionStart === 'number')
    el.selectionStart = el.selectionEnd = pos;
  else {
    var range = el.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}

var _caCheckSelection = function(el){
  if(typeof el.selectionStart === 'number'){
    if(el.selectionStart !== el.selectionEnd) return true;
    return el.selectionStart;
  } else if (document.selection) {
    var range = document.selection.createRange();
    if(range.text){return true};

    // get caret position in IE8
    var textInputRange = el.createTextRange();
    textInputRange.moveToBookmark(range.getBookmark());
    return -textInputRange.moveStart('character', -el.value.length);
  }
  return el.value.length;
}

var _caEnsureNumeric = function(e){
  if(!e) return '';

  var which = e.which;
  if(typeof which !== 'number'){
    which = e.keyCode;
  }

  if(e.metaKey || e.ctrlKey || e.altKey || which <= 18) return false;
  var character = String.fromCharCode(which);
  if(/[0-9]/.test(character)){
    return character;
  }
  e.preventDefault();
  return false;
}

var _caFormatExpiry = function(e){
  var character = _caEnsureNumeric(e);
  if(character === false) return;
  
  var pos = _caCheckSelection(this);
  if(pos === true) return;

  var value = this.value;
  var prefix = value.slice(0, pos);
  var prenums = prefix.replace(/[^0-9]/g,'');
  var suffix = value.slice(pos);
  var sufnums = suffix.replace(/[^0-9]/g,'');
  var el = this;

  if(pos === 0){
    if(/0|1/.test(character))
      return;
    else
      character = '0' + character;
      pos++;
  }

  if(pos === 1){
    if(parseInt(prefix + character) > 12){
      return e && e.preventDefault();
    }
    character += ' / ';
  }
  else if(pos === 2){
    character = ' / ' + character;
  }
  else{
    if(!/^(0[1-9]|1[012])($| \/ )($|[0-9]){2}$/.test(prefix + character + suffix))
      e && e.preventDefault();
    if(pos === 6)
      setTimeout(function(){card.filled(el)}, 200);
    return;
  }
  e && e.preventDefault();

  setTimeout(function(){
    el.value = (prenums + character + sufnums).slice(0, 7);
    pos = (prefix + character).length;
    _caSetCaret(el, pos);
  })
};

var _caFormatExpiryBack = function(e){
  if((e.which || e.keyCode) !== 8) return;
  var el = this;
  var pos = _caCheckSelection(el);
  
  if(pos === 5 && el.value.slice(2, 5) === ' / '){
    e.preventDefault();
    el.value = el.value.slice(0, 2);
  }
}

var _caFormatNumber = function(e){
  var character = _caEnsureNumeric(e);
  if(character === false) return;
  
  var pos = _caCheckSelection(this);
  if(pos === true) return;
  
  var value = this.value;
  var prefix = value.slice(0, pos).replace(/[^0-9]/g,'');
  var suffix = value.slice(pos).replace(/[^0-9]/g,'');
  value = prefix + character + suffix;
  
  var type = _caCardType(value) || 'unknown';
  var cardobj = _ca_card_formats[type];

  if(prefix.length + suffix.length >= cardobj.length) return;

  if(e){
    var el = this;
    e.preventDefault();
    setTimeout(function(){
      el.value = value.replace(cardobj.space, cardobj.subs);

      if(suffix){
        pos = prefix.length;
        var prespace = prefix.replace(cardobj.space, cardobj.subs).match(/ /g);
        pos += prespace && ++prespace.length || 1;
        _caSetCaret(el, pos);
      }
      if(value.length === cardobj.length)
        card.filled(el);
    })
  } else {
    this.value = value.replace(cardobj.space, cardobj.subs);      
  }
};

var _caFormatNumberBack = function(e){
  if((e.which || e.keyCode) !== 8) return;

  var el = this;
  var pos = _caCheckSelection(el);
  var val = el.value;
  var len = val.length;
  
  if(pos === len && val[len-1] === ' '){
    e.preventDefault();
    el.value = el.value.slice(0, len-2);
  }
};

var card = {
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
    $(el).on('keypress', _caFormatNumber);
    $(el).on('keydown', _caFormatNumberBack);
    $(el).on('keyup', function(){
      card.setType(this);
    });
    card.setType(el, !el.value && 'unknown');
    _caFormatNumber.call(el);
  },

  formatExpiry: function(el){
    if(!el) return;
    $(el).on('keypress', _caFormatExpiry);
    $(el).on('keydown', _caFormatExpiryBack);
  },

  ensureNumeric: function(el){
    if(!el) return;
    $(el).on('keypress', _caEnsureNumeric);
  },

  validateNumber: function(num, type){
    num = (num + '').replace(/\s|-/g,'');
    if(/^[0-9]+$/.test(num)){
      var type = type || _caCardType(num);
      if(type && _ca_card_formats[type].length === num.length){
        return this.luhn(num);
      }
    }
    return false;
  },
  getType: _caCardType,
  setType: $.noop,
  filled: $.noop
};