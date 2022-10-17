import { displayAmount } from 'common/currency';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';

const CLASS_IFRAME_ACTIVE = 'iframe-active';

const frameHtml = (amount, title) => `<div class='iframe-title'>
<b class='iframe-close'>&#xe604;</b> ${title || 'Payment'}
<b class='iframe-amount'>${amount}</b>
</div>
<iframe></iframe>`;

export default function Iframe(src, name, payment) {
  this.name = name;
  this.payment = payment;

  const razorpayOptions = payment.r.get();
  this.el = _El.create('div');
  _El.addClass('payment-frame', this.el);
  _El.setContents(
    frameHtml(
      displayAmount(
        payment.r,
        razorpayOptions.amount,
        razorpayOptions.currency
      ),
      razorpayOptions.name || razorpayOptions.description
    ),
    this.el
  );
  _El.appendTo(querySelector('#modal-inner'), this.el);

  Analytics.track('iframe:create');

  const contentWindow = this.el.querySelector('iframe').contentWindow;
  contentWindow['name'] = name;
  this.window = contentWindow;

  const closeListener = _El.on('click', () => {
    Analytics.track('iframe:cancel:click', {
      type: AnalyticsTypes.BEHAV,
    });
    if (global.confirm('Do you want to cancel this payment?')) {
      this.close();
      this.payment.emit('cancel');
    }
  })(querySelector('.iframe-close'));
  this.listeners = [closeListener];
}

Iframe.prototype = {
  on: function (event, func) {
    this.listeners.push(_El.on(event, func)(global));
  },

  write: function (html) {
    let pdoc = this.window.document;
    pdoc.write(html);
    pdoc.close();
  },

  close: function () {
    if (!this.closed) {
      this.closed = true;
      this.listeners.forEach((l) => l());
      this.listeners = [];
      _El.detach(this.el);
      _El.removeClass(querySelector('#modal'), CLASS_IFRAME_ACTIVE);

      Analytics.track('iframe:close');
      Analytics.removeMeta('iframe', false);
    }
  },

  show: function () {
    _El.setDisplay('block', this.el);
    const modalEl = querySelector('#modal');
    const bbox = _El.bbox(modalEl);

    _El.setStyles(modalEl, {
      height: bbox.height + 'px',
      width: bbox.width + 'px',
    });

    _El.offsetHeight(modalEl);
    _El.addClass(modalEl, CLASS_IFRAME_ACTIVE);

    Analytics.track('iframe:show');
    Analytics.setMeta('iframe', true);
  },
};
