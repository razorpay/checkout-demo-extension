import { get, writable } from 'svelte/store';
import { Views } from 'ui/tabs/card/constant';
import {
  getConvenienceFeeConfig,
  getDynamicFeeBearerMerchantMessage,
} from 'razorpay';
export const dynamicFeeObject = writable({});
export const showFeesIncl = writable({});
export const merchantMessage = writable('');
export const addCardView = writable('');

export function setDynamicFeeObject(instrument, type) {
  return getConvenienceFee(instrument, type);
}
export function setMerchantMessage() {
  let msg = getDynamicFeeBearerMerchantMessage();
  merchantMessage.update(() => msg);
}

function getConvenienceFee(instrument, type) {
  const config = getConvenienceFeeConfig();
  const selectedInstrument = config?.methods?.[instrument];
  if (selectedInstrument && Object.keys(selectedInstrument).length > 0) {
    if (type) {
      let keys = Object.keys(selectedInstrument);
      const convenience_fee = keys.includes('type')
        ? selectedInstrument?.type?.[type]
          ? Array.isArray(selectedInstrument.type[type])
            ? undefined
            : selectedInstrument.type[type].amount
            ? selectedInstrument.type[type].amount
            : selectedInstrument?.amount
          : selectedInstrument?.amount
        : selectedInstrument?.amount;
      if (convenience_fee) {
        dynamicFeeObject.update((obj) =>
          Object.assign({}, obj, {
            ['convenience_fee']: convenience_fee,
            ['checkout_label']: config?.label_on_checkout,
          })
        );
      } else {
        dynamicFeeObject.update((obj) =>
          Object.assign({}, obj, {
            ['checkout_label']: config?.label_on_checkout,
          })
        );
      }
    } else {
      const convenience_fee = selectedInstrument?.amount;
      if (convenience_fee) {
        dynamicFeeObject.update((obj) =>
          Object.assign({}, obj, {
            ['convenience_fee']: convenience_fee,
            ['checkout_label']: config?.label_on_checkout,
          })
        );
      } else {
        dynamicFeeObject.update((obj) =>
          Object.assign({}, obj, {
            ['checkout_label']: config?.label_on_checkout,
          })
        );
      }
    }
  } else {
    dynamicFeeObject.update((obj) =>
      Object.assign({}, obj, {
        ['checkout_label']: config?.label_on_checkout,
      })
    );
  }
}

export const isAddCardView = () => get(addCardView) === Views.ADD_CARD;
