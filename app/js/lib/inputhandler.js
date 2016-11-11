var InputHandler;
(function(){
  InputHandler = function(parent, targets) {
    this.el = parent;
    this.targets = parent.querySelectorAll('.input');
    this.refresh();
    each(
      ['focus', 'blur', 'input'],
      function(i, prop) {
        this.on(prop, function(e) {
          if (/input/.test(e.target.className)) {
            if (ua_iPhone && prop !== 'input') {
              Razorpay.sendMessage({event: prop});
            }
            this[prop](e);
          }
        }, true);
      },
      this
    )
  }
  var iproto = InputHandler.prototype = new EvtHandler();

  iproto.focus = function(e) {
    $(e.target.parentNode).addClass('focused');
  }

  iproto.blur = function(e) {
    $(e.target.parentNode).removeClass('focused')
      .addClass('mature');
    this.input(e);
  }

  iproto.input = function(e) {
    var el = e.target;
    var value = el.value;
    var required = isString(el.getAttribute('required'));
    var pattern = el.getAttribute('pattern');
    var $parent = $(el.parentNode);

    $parent.toggleClass('filled', value);

    // validity check past this
    if (!(required || pattern)) {
      return;
    }
    var valid = true;
    if (required && !value) {
      valid = false;
    }
    if (!required && !value) {
      valid = true;
    } else {
      if (valid && pattern) {
        valid = new RegExp(pattern).test(value);
      }
    }
    toggleInvalid($parent, valid);
  }

  iproto.refresh = function(){
    each(
      this.targets,
      function(i, target) {
        if (!(this.key in target)) {
          target[this.key] = 1;
        }
        this.input({target: target}) ;
      },
      this
    )
  }
})();