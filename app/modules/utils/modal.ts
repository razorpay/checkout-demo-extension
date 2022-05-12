import $ from 'lib/$';

export function Modal() {
  let timeout: NodeJS.Timeout | null;

  const clearTimeOut = function () {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = null;
  };

  const Modal = ((window as any).Modal = function (
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
      clearTimeOut();
    },

    hide: function () {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;
      this.container.removeClass('drishy');
      const self = this;

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
