function checkoutModal(opts){
  each(
    {
      fontAnchor: '#powered-link'
    },
    function(key, value){
      opts[key] = value;
    }
  )
  this.data = opts;
  this.timeouts = {};
  this.listeners = [];
  this.sanitize();

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
  render: function(){
    var div = document.createElement('div');
    div.innerHTML = templates.modal(this.data);
    this.el = div.firstChild;
    this.el.appendChild(this.renderCss());
    this.applyFont();
    return this.el;
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

  sanitizeOption: function(obj, key){
    var attr = obj[key];

    if(typeof attr === 'string'){
      obj[key] = attr.replace(/"/g,'');
    }
    else if(typeof attr === 'object'){
      each(
        attr,
        function(attrKey, attrObj){
          this.sanitizeOption(attrObj, attrKey);
        },
        this
      )
    }
  },

  sanitize: function(){ // warning: modifies this.data;
    var obj = this.data;
    // directly appended tags
    each(
      ['name', 'description', 'amount', 'currency', 'display_amount'],
      function(i, key){
        obj[key] = obj[key].replace(/<[^>]*>?/g, "");
      }
    )

    each(
      ['image', 'prefill', 'notes'],
      function(i, key){
        this.sanitizeOption(obj, key);
      },
      this
    )

    var contactPrefill = obj.prefill.contact;
    var contactFirstChar = contactPrefill[0];
    contactPrefill = contactPrefill.replace(/[^0-9]/g,'');
    if ( contactFirstChar === '+' ) {
      contactPrefill = '+' + contactPrefill;
    }
    obj.prefill.contact = contactPrefill;
  },

  applyFont: function(retryCount) {
    var anchor = this.data.fontAnchor;
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      this.el.addClass('font-loaded');
    }
    else if(retryCount < 25) {
      var self = this;
      this.timeouts.font = setTimeout(function(){
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  destroy: function(){
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