import OTPScreen from 'templates/screens/otp.svelte';
import Store from 'checkoutframe/store';

const SCREEN = 'otp';

export default function otpView({ on, target }) {
  this.target = target;
  this.on = on;

  this.render();
}

otpView.prototype = {
  render() {
    this.view = new OTPScreen({
      store: Store,
      target: this.target,

      data: {
        on: this.on,
      },
    });
  },

  setText(text) {
    this.updateScreen({
      text,
    });
  },

  destroy() {
    this.view.destroy();
  },

  updateScreen(updateProps) {
    const screenData = Store.get().screenData;

    screenData[SCREEN] = _Obj.extend(screenData[SCREEN], updateProps);

    Store.set({ screenData });
  },
};
