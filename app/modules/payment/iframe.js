export default function Iframe(src, name) {
  this.el =
    _El.create('iframe')
    |> _El.appendTo(_Doc.body)
    |> _El.addClass('payment-frame');

  this.window = this.el.contentWindow |> _Obj.setProp('name', name);

  this.listeners = [];
}

Iframe.prototype = {
  on: function(event, func) {
    this.listeners.push(global |> _El.on(event, func));
  },

  write: function(html) {
    var pdoc = this.window.document;
    pdoc.write(html);
    pdoc.close();
  },

  close: function() {
    _Arr.loop(this.listeners, l => l());
    this.listeners = [];
    this.el |> _El.detach;
  },
};
