import Config from 'config/index.js';
import FLOWS from 'config/FLOWS';
import RazorpayConfig from 'common/RazorpayConfig';

/**
 * Tells if we're being executed from
 * the same domain as the configured API
 */
export const isRazorpayFrame = () => {
  return (
    RazorpayConfig.api.indexOf(`${location.protocol}//${location.hostname}`) ===
    0
  );
};

/**
 * Check given data given flow is applicable or not
 * @param {PaymentData} data
 * @param {FLOWS} flowName
 * @returns {Boolean}
 *
 * TODO: improve for other methods (currently only cardless & wallet tested)
 */
export function checkValidFlow(data = {}, flowName = '') {
  if (!flowName) {
    return false;
  }
  // If we do not have a provider or wallet info: Eg, COD
  if (!data?.provider && !data?.wallet) {
    return Boolean(Config?.[data?.method]?.[flowName]);
  }
  return Boolean(
    Config?.[data?.method]?.[data?.wallet || data?.provider]?.[flowName]
  );
}

/**
 *
 * It creates Iframe used by forceIframe flow
 * @returns {HTMLIFrameElement}
 */
export function createIframe(show = false) {
  const iFrame = document.createElement('iframe');
  const modalElement = document.getElementById('modal');
  iFrame.height = modalElement.clientHeight
    ? `${modalElement.clientHeight}px`
    : '546px';
  iFrame.width = modalElement.clientWidth
    ? `${modalElement.clientWidth}px`
    : '344px';
  iFrame.setAttribute('class', 'mchild iframe-flow');
  iFrame.setAttribute('frameborder', '0');
  iFrame.setAttribute('id', 'iframeFlow');
  iFrame.style.display = show ? '' : 'none';
  document.getElementById('container').appendChild(iFrame);
  iFrame.window = {
    focus: function () {
      iFrame.style.display = '';
      if (modalElement) {
        modalElement.style.display = 'none';
      }
    },
    destroy: function () {
      iFrame.remove();
      if (modalElement) {
        modalElement.style.display = '';
      }
    },
    hide: function () {
      iFrame.style.display = 'none';
      if (modalElement) {
        modalElement.style.display = '';
      }
    },
  };
  return iFrame;
}
