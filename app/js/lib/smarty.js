(function(){

  var inputClass = 'input';
  var focusEvent = 'focus';
  var blurEvent = 'blur';
  var shim_placeholder = document.createElement('input').placeholder === undefined;

  var detectSupport = function(){
    var div = document.createElement('div');
    if(typeof div.onfocusin !== 'undefined'){
      focusEvent += 'in';
      blurEvent = 'focusout';
    }
  }

  var Smarty = window.Smarty = function(parent, options){
    this.parent = $(parent);
    this.options = options;
    this.listeners = [];
    detectSupport();
    this.common_events();
    this.init();
  }

  Smarty.prototype = {
    on: function(eventName, targetClass, eventHandler, useCapture){
      this.listeners.push(
        this.parent.on(
          eventName,
          function(e){
            if(!targetClass || e.target.className.match(targetClass)){
              eventHandler.call(this, e);
            }
          },
          useCapture,
          this
        )
      )
    },

    off: function(){
      invokeEach(this.listeners);
      this.listeners = [];
    },

    common_events: function(){
      this.on(focusEvent, inputClass, this.focus, true);
      this.on(blurEvent, inputClass, this.blur, true);
      this.on('input', inputClass, this.input, true);
    },

    focus: function(e){
      $(e.target.parentNode).addClass('focused');
    },

    blur: function(e){
      var $div = $(e.target.parentNode);
      $div.removeClass('focused');
      $div.addClass('mature');
      this.input(e);
    },

    intercept: function(e){
      var parent = e.target;
      var className = parent.className;
      if(/input/.test(className)){
        return;
      }
      if(!/elem/.test(parent.className)){
        parent = parent.parentNode;
      }
      var child = $(parent).find('.input')[0];
      if(child){
        invoke('focus', child, null, 0);
      }
    },

    input: function(e){
      var el = e.target;
      var parent = $(el.parentNode);
      var value = el.value;
      parent[value && 'addClass' || 'removeClass']('filled');
      if ( typeof el.getAttribute('ignore-input') === 'string' ) { return }

      var valid = true;
      var required = el.required || typeof el.getAttribute('required') === 'string';
      var pattern = el.getAttribute('pattern');

      if (required && !value) {
        valid = false;
      }
      if (valid && pattern) {
        valid = !value && !required || new RegExp(pattern).test(value);
      }
      parent[valid && 'removeClass' || 'addClass']('invalid');
    },

    init: function(){
      this.refresh(function(child){
        var attr = child.getAttribute('placeholder');
        if(attr && shim_placeholder){
          var placeholder = document.createElement('span');
          placeholder.className = 'placeholder';
          placeholder.innerHTML = attr;
          child.parentNode.insertBefore(placeholder, child);
        }
      })
    },

    refresh: function(callback){
      var self = this;
      each(
        $(this.parent[0]).find('.input'),
        function(i, el){
          self.update(el);
          if(callback){
            callback(el);
          }
        }
      )
    },

    update: function(el){
      if(el){
        this.input({target: el});
        try{
          if(document.activeElement === el) {
            el.parentNode.addClass('focused')
          }
        }
        catch(e){}
      }
    }
  }
})();