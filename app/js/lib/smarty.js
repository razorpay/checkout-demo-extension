var InputEvtHandler;
(function(){
  InputEvtHandler = function(parent, targets) {
    this.el = parent;
    this.targets = parent.querySelectorAll('.input');
    this.refresh();
    each(
      ['focus', 'blur', 'input'],
      function(i, prop) {
        this.on(prop, this[prop], true);
      },
      this
    )
  }
  var iproto = InputEvtHandler.prototype = new EvtHandler;

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
    var valid = true;

    if (required && !value) {
      valid = false;
    }
    if (valid && pattern) {
      valid = new RegExp(pattern).test(value);
    }
    $(el.parentNode).toggleClass('invalid', !valid)
      .toggleClass('filled', value);
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