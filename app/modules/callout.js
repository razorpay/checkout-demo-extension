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
    if (this.el |> _El.hasClass(shownClass)) {
      return;
    }

    _Doc.querySelector('#messages') |> _El.append(this.el);
    setTimeout(() => {
      this.el |> _El.addClass(shownClass);
    }, 10);
    return this;
  },
  hide: function() {
    this.el |> _El.removeClass(shownClass);
    setTimeout(() => {
      this.el |> _El.detach;
    }, 200);
    return this;
  },
};
