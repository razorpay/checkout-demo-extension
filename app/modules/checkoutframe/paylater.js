import PayLaterScreen from 'templates/screens/paylater.svelte';

const TARGET_QS = '#paylater-wrapper';

export default function PayLaterView() {}

PayLaterView.prototype = {
  setOptions: function(props) {
    const { on = {} } = props;

    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    if (!this.view) {
      this.view = new PayLaterScreen({
        target: _Doc.querySelector(TARGET_QS),
        props,
      });
    } else {
      this.view.set(props);
    }
  },
};
