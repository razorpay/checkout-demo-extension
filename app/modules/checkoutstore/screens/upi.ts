import { isCtaShown, showCtaWithDefaultText, hideCta } from 'checkoutstore/cta';
import { tick } from 'svelte';
import { writable, get } from 'svelte/store';
import { selectedInstrumentId } from './home';
export const intentVpaPrefill = writable('');
export const intentVpaPrefilledFromPreferences = writable(false);

const initValueForUpiAppForPay: UPI.UpiAppForPay = {
  callbackOnPay: undefined,
};
/**
 * This state is for UPI standalone Payment module but for capturing Pay-Button Click( preSubmit)
 * And this is also used for the highlighting app in UI
 */
export const selectedUPIAppForPay = writable(initValueForUpiAppForPay);

/**
 * Whenever another instrument is selected reset the `selectedUPIAppForPay`
 * As `selectedUPIAppForPay` is only used for independent payment module and is relying on pay-button
 * for downtime cases
 */
selectedInstrumentId.subscribe((data) => {
  if (data) {
    resetSelectedUPIAppForPay();
  }
});

export function resetSelectedUPIAppForPay() {
  selectedUPIAppForPay.update(() => initValueForUpiAppForPay);
}

selectedUPIAppForPay.subscribe((data: UPI.UpiAppForPay) => {
  if (data.app && data.app.shortcode) {
    selectedInstrumentId.set(null);
    /**
     * Why to tick here?
     * As seen above, when upi app is selected we are resetting selected instrument,
     * Which causes CTA to hide
     * But if selected Psp has downtime, we need pay button click
     * And immediate showCta would fail due to race conditions
     * Hence wait for a tick and then showCta
     */
    tick().then(() => {
      if (
        !isCtaShown() &&
        data &&
        data.downtimeConfig &&
        data.downtimeConfig.severe
      ) {
        showCtaWithDefaultText();
      }

      if (
        isCtaShown() &&
        data &&
        (!data.downtimeConfig || !data.downtimeConfig.severe)
      ) {
        hideCta();
      }
    });
  }
});
