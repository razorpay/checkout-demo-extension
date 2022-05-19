import { pushOverlay } from 'navstack';
import AccountModal from 'one_click_checkout/account_modal/ui/AccountModal.svelte';

export function showAccountModal(options) {
  pushOverlay({
    component: AccountModal,
    props: {
      options,
    },
  });
}
