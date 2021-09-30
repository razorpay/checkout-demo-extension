(function () {
  var timeout, transitionProperty;

  var defaults = {
    escape: true,
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    backdropclose: true,
    onhide: null,
    onhidden: null,
  };

  var clearTimeout = function () {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = null;
  };

  if (Array.prototype.some) {
    ['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some(
      function (i) {
        if (isString(document.documentElement.style[i])) {
          transitionProperty = i + 'Duration';
          return true;
        }
      }
    );
  }

  var getDuration = function (modal) {
    return modal.options.animation && transitionProperty ? 300 : 0;
  };

  var Modal = (window.Modal = function (element, options) {
    each(defaults, function (key, val) {
      if (!(key in options)) {
        options[key] = val;
      }
    });
    this.options = options;
    this.container = $(element);
    this.animationDuration = getDuration(this);

    this.listeners = [];
    this.show();
    this.bind();
  });

  Modal.prototype = {
    show: function () {
      if (this.isShown) {
        return;
      }
      this.isShown = true;
      this.container.reflow().addClass('drishy');
      clearTimeout();
      timeout = setTimeout(this.shown, this.animationDuration);
      this.container.focus();
    },

    shown: function () {
      clearTimeout();
    },

    hide: function () {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;

      this.container.removeClass('drishy');

      clearTimeout();
      var self = this;

      timeout = setTimeout(function () {
        self.hidden();
      }, this.animationDuration);

      invoke(this.options.onhide);
    },

    handleBackdropClick: function () {
      // Let parent handle any clicks
      var shouldClose = this.options.handleBackdropClick();

      if (shouldClose) {
        this.backdropHide();
      }
    },

    backdropHide: function () {
      if (this.options.backdropclose) {
        this.hide();
      }
    },

    hidden: function () {
      clearTimeout();
      invoke(this.options.onhidden);
    },

    on: function (event, target, callback) {
      this.listeners.push($(target).on(event, callback, false, this));
    },

    steal_focus: function (e) {
      if (!e.relatedTarget) {
        return;
      }
      if (!$(this).find(e.relatedTarget).length) {
        return this.focus();
      }
    },

    bind: function () {
      this.on('resize', window, function () {
        var el = document.activeElement;
        if (['input'].indexOf(el.tagName.toLowerCase()) >= 0) {
          /**
           * When device is rotated or the keyboard is shown,
           * if an input element was focused on,
           * it might get hidden behind the keyboard.
           * Let's bring it into view.
           */
          setTimeout(function () {
            $(el).scrollIntoView();
          });
        }
      });

      if (this.options.escape) {
        this.on('keyup', window, function (e) {
          if ((e.which || e.keyCode) === 27) {
            // Element wants to handle "Escape" by itself
            if ($(e.target).hasClass('no-escape')) {
              return;
            }

            if (
              !hideEmi() &&
              !hideRecurringCardsOverlay() &&
              !Backdrop.isVisible()
            ) {
              this.hide();
            }
          }
        });
      }

      this.on('click', gel('backdrop'), this.handleBackdropClick);
    },

    destroy: function () {
      invokeEach(this.listeners);
      this.listeners = [];
    },
  };
})();
