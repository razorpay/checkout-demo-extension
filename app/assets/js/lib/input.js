(function(root){
  var $ = root.$;
  var inputClass = 'input';
  var divClass = 'form-elem';
  var tooltipClass = 'tooltip';

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
    // this.refresh();
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
      this.on('mousedown', tooltipClass, function(e){e.target.style.display = 'none'});
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
      var parent = $(el.parentNode);
      var value = el.value;
      var valid = true;
      var required = typeof el.getAttribute('required') == 'string';
      var pattern = el.getAttribute('pattern');

      if (required && !value) {
        valid = false;
      }
      if (valid && pattern) {
        valid = new RegExp(pattern).test(value);
      }
      
      parent[valid && 'removeClass' || 'addClass']('invalid');
      parent[value && 'removeClass' || 'addClass']('filled');
    },

    refresh: function(){
      var els = this.parent[0].getElementsByTagName('p');
      var elslen = els.length;
      for(var i=0; i<elslen; i++){
        var child = $(els[i]).children('input');
        child.length && this.update(child[0]);
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