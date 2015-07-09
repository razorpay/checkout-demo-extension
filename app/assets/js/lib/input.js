(function(root){
  var $ = root.$;
  var inputClass = 'input';
  var divClass = 'form-elem';
  var tooltipClass = 'help-text';

  var focusEvent = 'focus';
  var blurEvent = 'blur';

  var detectSupport = function(){
    var div = document.createElement('div');
    if(typeof div.onfocusin != 'undefined'){
      focusEvent += 'in';
      blurEvent = 'focusout';
    }
  }

  root.Smarty = function(parent, options){
    this.parent = parent;
    this.options = options;
    this.listeners = [];
    detectSupport();
    this.common_events();
    this.init();
  }

  root.Smarty.prototype = {
    on: function(eventName, targetClass, eventHandler, useCapture){
      var smarty = this;
      var listenerRef = this.parent.on(eventName, function(e){
        if(!targetClass || e.target.className.match(targetClass))
          eventHandler.call(smarty, e);
      }, useCapture);
      this.listeners.push(eventName, listenerRef, useCapture);
    },

    off: function(){
      for(var i=0; i<this.listeners.length; i++){
        var l = this.listeners[i];
        this.parent.off(l[0], l[1], l[2]);
      }
    },

    common_events: function(){
      this.on(focusEvent, inputClass, this.focus, true);
      this.on(blurEvent, inputClass, this.blur, true);

      this.on('input', inputClass, this.input, true);

      this.on('click', divClass, this.intercept);
      this.on('mouseover', tooltipClass, function(e){e.target.style.display = 'none'});
    },

    focus: function(e){
      $(e.target.parentNode).addClass('focused');
    },

    blur: function(e){
      $div = $(e.target.parentNode);
      $div.removeClass('focused');
      $div.addClass('mature');
      this.input(e);
    },

    intercept: function(e){
      var child = $(e.target).children('input');
      child.length && child[0].focus();
    },

    input: function(e){
      var el = e.target;
      if(e.type == 'input' && typeof el.getAttribute('ignore-input') == 'string') return;
      var parent = $(el.parentNode);
      var value = el.value;
      var valid = true;
      var required = el.required || typeof el.getAttribute('required') == 'string';
      var pattern = el.getAttribute('pattern');

      if (required && !value) {
        valid = false;
      }
      if (valid && pattern) {
        valid = !value && !required || new RegExp(pattern).test(value);
      }
      parent[valid && 'removeClass' || 'addClass']('invalid');
      parent[value && 'addClass' || 'removeClass']('filled');
    },

    init: function(){
      var els = this.parent[0].getElementsByTagName('p');
      var elslen = els.length;
      for(var i=0; i<elslen; i++){
        var child = $(els[i]).children('input');
        if(child.length){
          child = child[0];
          this.update(child);
          if(typeof child.placeholder != 'string'){
            var placeholder = document.createElement('span');
            placeholder.className = 'placeholder';
            placeholder.innerHTML = child.getAttribute('placeholder');
            els[i].appendChild(placeholder);
          }
        }
      }
    },

    update: function(el){
      if(el){
        this.input({target: el});
        try{ if(document.activeElement == el) el.parentNode.addClass('focused')} catch(e){}
      }
    }
  }
})(window);