var Card;
(function(){

  var patterns = {
    maestro16: /^(508125|508126|508159|508192|508227|504437|504681)/,
    maestro: /^(50|63|66|5[6-8]|6[8-9]|600[0-9]|6010|601[2-9]|60[2-9]|61|620|621|6220|6221[0-1])/,
    mastercard: /^(5[1-5]|2[2-7])/,
    visa: /^4/,
    // maestro: /^(5(018|0[23]|[68])|6(39|7))/,
    amex: /^3[47]/,
    diners: /^3[0689]/
    // jcb: /^35/,
    // discover: /^6([045]|22)/
    // rupay: /^(508[5-9][0-9][0-9]|60698[5-9]|60699[0-9]|60738[4-9]|60739[0-9]|607[0-8][0-9][0-9]|6079[0-7][0-9]|60798[0-4]|608[0-4][0-9][0-9]|608500|6521[5-9][0-9]|652[2-9][0-9][0-9]|6530[0-9][0-9]|6531[0-4][0-9]|6070(66|90|32|74|94|27|93|02|76)|6071(26|05|65)|607243)/
  }

  var space_14 = /(.{4})(.{0,6})/;
  var sub_14 = function( match, $1, $2 ){

    if ( $2.length === 6 ){
      $2 += ' ';
    }
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
    }
  }
  card_formats.unknown = card_formats.maestro;

  each(patterns, function(c){
    if(!(c in card_formats)){
      card_formats[c] = {
        space: /(.{4}(?=.))/g,
        subs: '$1 ',
        length: 16
      }
    }
  })

  var CardType = function(num){
    for( var t in patterns ) {
      if( patterns[t].test(num.replace(/[^0-9]/g,'')) ) {
        return t;
      }
    }
  }

  var SetCaret = function(el, pos){
    if(navigator.userAgent.indexOf('Android')){
      return;
    }
    if(typeof el.selectionStart === 'number'){
      el.selectionStart = el.selectionEnd = pos;
    }
    else {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  var CheckSelection = function(el){
    if(typeof el.selectionStart === 'number'){
      if(el.selectionStart !== el.selectionEnd) { return true }
      return el.selectionStart;
    } else if (document.selection) {
      var range = document.selection.createRange();
      if(range.text) { return true }

      // get caret position in IE8
      var textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      return -textInputRange.moveStart('character', -el.value.length);
    }
    return el.value.length;
  }

  function ensureNumeric(e){
    return ensureRegex(e, /[0-9]/);
  }

  function ensurePhone(e){
    return ensureRegex(e, e.target.value.length ? /[0-9]/ : /[+0-9]/);
  }

  function ensureExpiry(e){
    var shouldSlashBeAllowed = /^\d{2} ?$/.test(e.target.value);
    return ensureRegex(e, shouldSlashBeAllowed ? /[\/0-9]/ : /[0-9]/);
  }

  function ensureRegex(e, regex){
    if(!e) { return '' }

    var which = e.which;
    if(typeof which !== 'number'){
      which = e.keyCode;
    }

    if(e.metaKey || e.ctrlKey || e.altKey || which <= 18) { return false }
    var character = String.fromCharCode(which);
    if(regex.test(character)){
      return character;
    }
    preventDefault(e);
    return false;
  }

  var FormatExpiry = function(e) {
    var el = e.target;
    var character = ensureExpiry(e);
    if (character === false) { return }

    var pos = CheckSelection(el);
    if (pos === true) { return }

    var value = el.value;
    var prefix = value.slice(0, pos);
    var prenums = prefix.replace(/[^\/0-9]/g,'');
    var suffix = value.slice(pos);
    var sufnums = suffix.replace(/[^\/0-9]/g,'');

    if (pos === 0) {
      if(/0|1/.test(character)) { return }
      character = '0' + character;
      pos++;
    }

    if (pos === 1) {
      if( parseInt(prefix + character, 10) > 12 ) { return preventDefault(e) }
      character += ' / ';
    }
    else if ( pos === 2 ) {
      if(character === '/'){
        character = ' ' + character + ' ';
      }
      else {
        character = ' / ' + character;
      }
    }
    else {
      if(!/^(0[1-9]|1[012])($| \/ )($|[0-9]){2}$/.test(prefix + character + suffix) && e){
        preventDefault(e);
      }
      if(pos === 6){
        var card = this;
        setTimeout(function(){card.filled(el)}, 200);
      }
      return;
    }
    preventDefault(e);

    setTimeout(function() {
      el.value = (prenums + character + sufnums).slice(0, 7);
      pos = (prefix + character).length;
      SetCaret(el, pos);
    })
  };

  var FormatExpiryBack = function(e){
    var el = e.target;
    if((e.which || e.keyCode) !== 8) { return }
    var pos = CheckSelection(el);

    if(pos === 5 && el.value.slice(2, 5) === ' / '){
      preventDefault(e);
      el.value = el.value.slice(0, 2);
    }
  }

  var FormatNumber = function(e){
    var character = ensureNumeric(e);
    var el = e.target;

    var pos = CheckSelection(el);
    if(pos === true) { return }

    var value = el.value;
    var prefix = value.slice(0, pos).replace(/[^0-9]/g,'');
    var suffix = value.slice(pos).replace(/[^0-9]/g,'');
    value = prefix + character + suffix;

    var type = CardType(value) || 'unknown';
    var cardobj = card_formats[type];

    if(prefix.length + suffix.length >= cardobj.length) { return }

    var card = this;
    preventDefault(e);

    if(e) {
      setTimeout(function(){
        el.value = value.replace(cardobj.space, cardobj.subs);

        if(suffix){
          pos = prefix.length;
          var prespace = prefix.replace(cardobj.space, cardobj.subs).match(/ /g);
          pos += prespace && ++prespace.length || 1;
          SetCaret(el, pos);
        }
        if(value.length === cardobj.length){
          card.filled(el);
        }
      })
    } else {
      el.value = value.replace(cardobj.space, cardobj.subs);
    }
  };

  var FormatNumberBack = function(e){
    if((e.which || e.keyCode) !== 8) { return }

    var el = e.target;
    var pos = CheckSelection(el);
    var val = el.value;
    var len = val.length;
    
    if(pos === len && val[len-1] === ' '){
      preventDefault(e);
      el.value = el.value.slice(0, len-2);
    }
  };

  Card = function(){
    this.listeners = [];
  }

  Card.luhn = function(num){
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
  }

  Card.validateCardNumber = function(num, type){
    num = (num + '').replace(/\s|-/g,'');
    if(/^[0-9]+$/.test(num)){
      if (!type) {
        type = CardType(num);
      }
      if (!type && num.length > 13 || type && card_formats[type].length === num.length) {
        return Card.luhn(num);
      }
    }
    return false;
  }

  Card.prototype = {
    bind: function(el, eventListeners){
      if( !el ) { return }
      var $el = $(el);
      each(
        eventListeners,
        function(event, listener){
          eventListeners[event] = $el.on(event, listener, null, this);
        },
        this
      )
      this.listeners.push([$el, eventListeners])
    },

    unbind: function(){
      each(
        this.listeners,
        function(i, L){
          each(
            L[1],
            function(j, event, listenerRef){
              L[0].off(event, listenerRef);
            }
          )
        }
      )
    },

    formatCardNumber: function(el){
      this.bind(el, {
        keypress: FormatNumber,
        keydown: FormatNumberBack,
        keyup: this.setType
      })
      if(el){
        this.setType({target: el});
        FormatNumber.call(this, {target: el});
      }
    },

    formatCardExpiry: function(el){
      this.bind(el, {
        keypress: FormatExpiry,
        keydown: FormatExpiryBack
      })
    },

    ensureNumeric: function(el){
      this.bind(el, {
        keypress: ensureNumeric
      })
    },

    ensurePhone: function(el){
      this.bind(el, {
        keypress: ensurePhone
      })
    },
    getType: CardType,
    setType: noop,
    filled: noop
  };

})();