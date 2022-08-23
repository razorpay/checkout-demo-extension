import { pushOverlay } from 'navstack';
import AccountModal from 'account_modal/ui/AccountModal.svelte';
import MerchantIFrameSvelte from './ui/MerchantIFrame.svelte';

export function showAccountModal(options) {
  pushOverlay({
    component: AccountModal,
    props: {
      options,
    },
  });
}

export function showMerchantFrame() {
  pushOverlay({
    component: MerchantIFrameSvelte,
    props: {},
  });
}
