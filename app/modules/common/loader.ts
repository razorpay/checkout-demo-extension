import { capture, SEVERITY_LEVELS } from 'error-service';
import * as _El from 'utils/DOM';

export function appendLoader(
  $parent: HTMLElement = document.body,
  parent?: HTMLElement,
  injectKeyframe = false
) {
  let loader: HTMLDivElement;
  try {
    if (injectKeyframe) {
      document.body.style.background = '#00000080';
      const style = _El.create('style');
      style.innerText =
        '@keyframes rzp-rot{to{transform: rotate(360deg);}}@-webkit-keyframes rzp-rot{to{-webkit-transform: rotate(360deg);}}';
      _El.appendTo(style, $parent);
    }
    loader = document.createElement('div');
    loader.className = 'razorpay-loader';
    let style =
      'margin:-25px 0 0 -25px;height:50px;width:50px;animation:rzp-rot 1s infinite linear;-webkit-animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;';
    if (parent) {
      style +=
        'margin: 100px auto -150px;border: 1px solid rgba(0, 0, 0, 0.2);border-top-color: rgba(0, 0, 0, 0.7);';
    } else {
      style += 'position:absolute;left:50%;top:50%;';
    }
    loader.setAttribute('style', style);
    _El.appendTo(loader, $parent);
    return loader;
  } catch (e) {
    capture(e as Error, {
      severity: SEVERITY_LEVELS.S3,
      unhandled: false,
    });
  }
}
