
// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

// element to verfy whether font has been loaded
var fontAnchor = '#powered-link';

// sanitizing innerHTML
function sanitizeContent(obj, fieldsArr){
  each(
    fieldsArr,
    function(i, key){
      obj[key] = obj[key].replace(/<[^>]*>?/g, "");
    }
  )
}

function sanitize(message){ // warning: modifies message;
  var options = message.options;
  var data = message.data;
  // sanitize options affecting innerHTML
  sanitizeContent(
    options,
    ['name', 'description', 'amount', 'currency', 'display_amount']
  )


  sanitizeValue(
    options,
    ['image', 'prefill', 'notes']
  )

  data.contact = sanitizeContact(data.contact || options.prefill.contact);
}

function sanitizeValue(obj, key){
  if(key instanceof Array){
    return each(
      key,
      function(i, field){
        sanitizeValue(obj, field);
      }
    )
  }
  var attr = obj[key];

  if(typeof attr === 'string'){
    obj[key] = attr.replace(/"/g,'');
  }
  else if(typeof attr === 'object'){
    each(
      attr,
      function(attrKey, attrObj){
        sanitizeValue(attrObj, attrKey);
      }
    )
  }
}

function sanitizeContact(contactPrefill){
  var contactFirstChar = contactPrefill[0];
  contactPrefill = contactPrefill.replace(/[^0-9]/g,'');
  if ( contactFirstChar === '+' ) {
    contactPrefill = '+' + contactPrefill;
  }
  return contactPrefill;
}

function checkoutModal(){
  this.listeners = [];

  // var classes = [];

  // if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
  //   classes.push('mobile');
  // }

  // if(!opts.image){
  //   classes.push('noimage');
  // }

  // if(shouldFixFixed){
  //   classes.push('ip')
  // }

  // $(container).addClass(classes.join(' '));
}

checkoutModal.prototype = {
  getEl: function(){
    if(!this.el){
      var div = document.createElement('div');
      div.innerHTML = templates.modal(this.data);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
    }
    return this.el;
  },

  fillData: function(data){

    if(data.method){
      this.changeTab({target: $('#method-' + data.method + '-tab')[0]});
    }

    if(('card[expiry_month]' in data) && ('card[expiry_year]' in data)) {
      data['card[expiry]'] = data['card[expiry_month]'] + ' / ' + data['card[expiry_year]'];
    }

    each(
      {
        'contact': 'contact',
        'email': 'email',
        'bank': 'bank-select'
        'card[name]': 'card_name',
        'card[number]': 'card_number',
        'card[expiry]': 'card_expiry',
        'card[cvv]': 'card_cvv',
      },
      function(name, id){
        var el = gel(id);
        if(el) {
          var val = data[name];
          if(val){
            el.value = val;
          }
        }
      }
    )
  },

  render: function(message){
    sanitize(message);
    this.getEl();
    this.fillData(message.data);
    this.modal = new Modal(this.el, message.options.modal);
    this.smarty = new Smarty(this.el);
  },

  renderCss: function(){
    var div = this.el;
    var col = this.data.theme.color;
    var style = document.createElement('style');
    try{
      div.style.color = col;
      if(div.style.color){
        var rules = templates.theme(col);
        if (style.styleSheet) {
          style.styleSheet.cssText = rules;
        } else {
          style.appendChild(document.createTextNode(rules));
        }
      }
      div.style.color = '';
    } catch(e){
      roll(e.message);
    }
    return style;
  },

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      $(this.el).addClass('font-loaded');
    }
    else if(retryCount < 25) {
      var self = this;
      this.timeouts.font = setTimeout(function(){
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  shake: function(){
    if ( this.el ) {
      $(this.el.querySelector('#modal-inner'))
        .removeClass('shake')
        .reflow()
        .addClass('shake');
    }
  },

  unrender: function(){
    each(this.timeouts, function(key, val){
      clearTimeout(val);
    })
    this.timeouts = {};

    each(this.listeners, function(listener){
      listener[0].off(listener[1], listener[2], listener[3]);
    })
    this.listeners = [];
    $(this.el).remove();
  }
}