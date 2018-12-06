import { displayAmount } from 'common/currency';

const CLASS_IFRAME_ACTIVE = 'iframe-active';

const frameHtml = (amount, title) => `<div class='iframe-title'>
<b class='iframe-close'>&#xe604;</b> ${title}
<b class='iframe-amount'>${amount}</b>
</div>
<iframe></iframe>`;

export default function Iframe(src, name, payment) {
  this.name = name;
  this.payment = payment;

  const razorpayOptions = payment.r.get();
  this.el =
    _El.create('div')
    |> _El.addClass('payment-frame')
    |> _El.setContents(
      frameHtml(
        displayAmount(payment.r, razorpayOptions.amount),
        razorpayOptions.name || razorpayOptions.description
      )
    )
    |> _El.appendTo(_Doc.querySelector('#modal-inner'));

  this.window =
    this.el.querySelector('iframe').contentWindow |> _Obj.setProp('name', name);

  const closeListener =
    _Doc.querySelector('.iframe-close')
    |> _El.on('click', () => {
      if (global.confirm('Do you want to cancel this payment?')) {
        this.close();
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
    if (!this.closed) {
      this.closed = true;
      _Arr.loop(this.listeners, l => l());
      this.listeners = [];
      this.el |> _El.detach;
      _Doc.querySelector('#modal') |> _El.removeClass(CLASS_IFRAME_ACTIVE);
    }
  },

  show: function() {
    const modalEl = _Doc.querySelector('#modal');
    const bbox = modalEl |> _El.bbox;

    modalEl
      |> _El.setStyles({
        height: bbox.height + 'px',
        width: bbox.width + 'px',
      });

    modalEl |> _El.offsetHeight;
    modalEl |> _El.addClass(CLASS_IFRAME_ACTIVE);
  },
};
