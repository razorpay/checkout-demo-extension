import $ from 'lib/$';

export function Modal() {
  var timeout: NodeJS.Timeout | null;

  var clearTimeout = function () {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = null;
  };

  var Modal = ((window as any).Modal = function (
    element: HTMLElement,
    options: any
  ) {
    this.options = options;
    this.container = $(element);
    this.show();
  });

  Modal.prototype = {
    show: function () {
      if (this.isShown) {
        return;
      }
      this.isShown = true;
      this.container.reflow().addClass('drishy');
      clearTimeout();
    },

    hide: function () {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;
      this.container.removeClass('drishy');
      var self = this;

      timeout = setTimeout(
        function () {
          self.hidden();
        },
        this.options.animation ? 300 : 0
      );

      this.options.onhide();
    },

    hidden: function () {
      this.options.onhidden();
    },
  };
}
Modal();
