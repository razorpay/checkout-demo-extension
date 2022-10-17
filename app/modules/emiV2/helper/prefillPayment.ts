import { handleEmiPaymentV2 } from 'emiV2/payment';
import { selectedBank } from 'emiV2/store';
import EmiTabsScreenSvelte from 'emiV2/ui/components/EmiTabsScreen/EmiTabsScreen.svelte';
import { pushStack } from 'navstack';
import { isEmiRedirectFlow } from './helper';
import { updateSessionScreenStore, updateTabStore } from './navigation';

/**
 * Helper function to initiate a cardless emi payment
 * When a prefill value is passed to checkout
 * The functions initiates a payment for providers like zestoney/axio
 * and for other cardless provider like hdfc, earlysalary
 * redirects the user to emi plans screen to show emi plans and check for cardless eligibilty
 * @param provider {string}
 */
export const attemptCardlessEmiPayment = (provider: string) => {
  // Update L1 screen value in session and screenstore
  // Before moving to next screen in order to render CTA
  updateTabStore('emi');
  updateSessionScreenStore('emi');
  // Update the selected emi provider
  selectedBank.set({
    code: provider,
    name: provider,
    isCardless: true,
  });
  // If the provider is redirect provider like zestmoney, earlysalary
  // initiate the payment and redirect the user
  if (isEmiRedirectFlow(provider)) {
    handleEmiPaymentV2({
      action: 'cardless',
      payloadData: {
        provider,
      },
    });
    return;
  }
  // Update the navstack with emi plans screen
  pushStack({
    component: EmiTabsScreenSvelte,
  });
  // Update screen store and track screen switch event
  // Since next screen is emiPlans
  updateSessionScreenStore('emiPlans');
};
