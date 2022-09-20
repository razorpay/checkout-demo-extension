import { get } from 'svelte/store';
import Config from 'config/index.js';
import RazorpayConfig from 'common/RazorpayConfig';
import { selectedInstrument } from 'checkoutstore/screens/home';
import { getCardMetadata } from 'common/card';
import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { customer } from 'checkoutstore/customer';
import { getUPIAppDataFromHandle } from 'common/upi';

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

// function to generate instrument and method level data generate at submit time to send in various events
export function getInstrumentDataAfterSubmitClick(data) {
  try {
    const selectedInstr = get(selectedInstrument);
    const method = data.method;
    const personalisation = !!selectedInstr?.meta?.preferred;

    const instrumentKey = {
      cardless_emi: 'provider',
      paylater: 'provider',
      app: 'provider',
      wallet: 'wallet',
      netbanking: 'bank',
    };

    switch (method) {
      case 'card': {
        // for issuer and network if we have card number we can get this from getCardMetadata function
        // but in case of saved card we don't have card_number so getting this details from user saved card tokens
        let issuer = '';
        let network = '';
        let type = '';
        if (data['card[number]']) {
          const card = getCardMetadata(data['card[number]']);
          issuer = card?.issuer || '';
          network = card?.network || '';
          type = card?.type || '';
        } else if (data.token) {
          const tokens = get(customer)?.tokens?.items || [];
          const selectedToken =
            tokens.find((item) => item.token === data.token) || {};
          issuer = selectedToken?.card?.issuer || '';
          network = selectedToken?.card?.network || '';
          type = selectedToken?.card?.type || '';
        }

        return {
          method: { name: method },
          instrument: {
            issuer,
            personalisation,
            saved: !!data.token,
            network,
            type,
          },
        };
      }
      case 'upi': {
        if (data?.upi?.flow === 'intent' || data['_[flow]'] === 'intent') {
          //for upi as intent , if app_name present it means some app chosen showing name of app otherwise checking if qr then sending name as 'qr' for instrument.name
          return {
            method: { name: method },
            instrument: {
              name:
                get(selectedUPIAppForPay)?.app?.app_name ||
                (data['_[upiqr]'] ? 'qr' : ''),
              personalisation,
              saved: !!data.token,
              type: 'intent',
            },
          };
        }

        /**
         *
         * for vpa if we type vpa then it is accessible in data otherwise getting it from selectedInstrument in case of save preferred
         * in case of save vpa we get flow in data['_[flow]' otherwise data.upi.flow
         * if saved from L1 screen then get it from saved tokens of customer
         *
         */
        let vpa = data.vpa || selectedInstr?.vpas?.[0] || '';
        if (vpa) {
          vpa = vpa.split('@')[1];
        }
        if (!vpa && data.token) {
          const tokens = get(customer)?.tokens?.items || [];
          const selectedToken =
            tokens.find((item) => item.token === data.token) || {};

          vpa = selectedToken?.vpa?.handle || '';
        }
        const app = getUPIAppDataFromHandle(vpa) || {};

        return {
          method: { name: method },
          instrument: {
            name: app?.app_name || '',
            personalisation,
            saved: !!data.token,
            type: data?.upi?.flow || data['_[flow]'],
            vpa: `@${vpa}`,
          },
        };
      }

      default: {
        return {
          method: { name: method },
          instrument: {
            name: data[instrumentKey[method]],
            personalisation,
            saved: false,
          },
        };
      }
    }
  } catch {
    return {};
  }
}
