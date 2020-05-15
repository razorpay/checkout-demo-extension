import OTPScreen from 'ui/tabs/otp/index.svelte';
import * as OtpScreenStore from 'checkoutstore/screens/otp';

export default function otpView({ target, props }) {
  this.render(target, props);
}

otpView.prototype = {
  render(target, props) {
    this.view = new OTPScreen({
      target,
      props,
    });
  },

  setText(text) {
    this.updateScreen({
      text,
    });
  },

  $destroy() {
    this.view.$destroy();
  },

  onBack() {
    this.view.onBack();
  },

  updateScreen(props) {
    _Obj.loop(props, (val, prop) => {
      if (OtpScreenStore[prop]) {
        OtpScreenStore[prop].set(val);
      }
    });
  },
};
