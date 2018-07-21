import Razorpay, { RazorpayConfig } from 'common/Razorpay';
import 'checkoutjs/options';
import 'payment';
import Track from 'tracker';

Track.props.library = 'checkoutjs';
RazorpayConfig.api = _Doc.resolveUrl(RazorpayConfig.frameApi);

global.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  Track(getSession().r, 'js_error', {
    message: errorMsg,
    line: lineNumber,
    col: column,
    stack: errorObj && errorObj.stack,
  });
};
