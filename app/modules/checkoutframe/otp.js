import OTPScreen from 'templates/screens/otp.svelte';
import OtpScreenStore from 'checkoutstore/screens/otp';

const SCREEN = 'otp';

export default function otpView({ on, target }) {
  this.target = target;
  this.on = on;

  this.render();
}

otpView.prototype = {
  render() {
    this.view = new OTPScreen({
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
    OtpScreenStore.set(updateProps);
  },
};
