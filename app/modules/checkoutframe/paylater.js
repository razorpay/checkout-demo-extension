import PayLaterScreen from 'templates/screens/paylater.svelte';

const TARGET_QS = '#paylater-wrapper';

export default function PayLaterView(session) {
  this.session = session;
}

PayLaterView.prototype = {
  setOptions: function(data) {
    const { on = {} } = data;

    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    if (!this.view) {
      this.view = new PayLaterScreen({
        target: _Doc.querySelector(TARGET_QS),
        data,
      });
    } else {
      this.view.set(data);
    }
  },
};
