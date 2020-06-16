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

  setTextView(textView, templateData = {}) {
    /**
     * IMPORTANT: Do not merge these calls into a single updateScreen call.
     * We need to ensure that template data is set before rendering the actual
     * template. Since stores are being updated one by one, svelte-i18n throws
     * an exception if template variables are missing when text is set.
     */
    this.updateScreen({
      templateData,
    });
    this.updateScreen({
      textView,
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
