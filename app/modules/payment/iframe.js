import { displayAmount } from 'common/currency';

const frameHtml = amount => `<div class='iframe-title'>
<b class='iframe-close'>&#xe604;</b>
Paying <b class='iframe-amount'>${amount}</b>
</div>
<iframe></iframe>`;

export default function Iframe(src, name, payment) {
  this.name = name;
  this.payment = payment;
  this.el =
    _El.create('div')
    |> _El.setContents(
      frameHtml(displayAmount(payment.r, payment.r.get('amount')))
    )
    |> _El.appendTo(_Doc.querySelector('#modal-inner'))
    |> _El.addClass('payment-frame');

  this.window =
    this.el.querySelector('iframe').contentWindow |> _Obj.setProp('name', name);

  const closeListener =
    _Doc.querySelector('.iframe-close')
    |> _El.on('click', () => {
      if (global.confirm('Do you want to cancel this payment?')) {
        this.payment.emit('cancel');
      }
    });
  this.listeners = [closeListener];
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

  show: function() {
    this.el |> _El.setDisplay('block');
  },
};
