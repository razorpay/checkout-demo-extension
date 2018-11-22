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

  updateScreen(updateProps) {
    const store = Store.get();

    store.screenData[SCREEN] = _Obj.extend(
      store.screenData[SCREEN],
      updateProps
    );

    Store.set(store);
  },
};
