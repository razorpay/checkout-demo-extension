import { SHOWN_CLASS } from 'common/constants';

/* global templates */

export default function Callout(options) {
  this.options = options;

  /* TODO: update after addition of dom.js */
  this.el =
    _El.create('div')
    |> _El.setContents(templates.callout(options))
    |> _El.firstChild;
}

Callout.prototype = {
  show: function() {
    if (this.el |> _El.hasClass(SHOWN_CLASS)) {
      return;
    }

    _Doc.querySelector('#messages') |> _El.append(this.el);
    setTimeout(() => {
      this.el |> _El.addClass(SHOWN_CLASS);
    }, 10);
    return this;
  },
  hide: function() {
    this.el |> _El.removeClass(SHOWN_CLASS);
    setTimeout(() => {
      this.el |> _El.detach;
    }, 200);
    return this;
  },
};
