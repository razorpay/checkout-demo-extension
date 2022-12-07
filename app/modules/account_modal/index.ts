import { pushOverlay } from 'navstack';
import AccountModal from 'account_modal/ui/AccountModal.svelte';
import MerchantIFrameSvelte from 'account_modal/ui/MerchantIFrame.svelte';
import type { ValueOf } from 'types/utils';
import type { ACCOUNT_VARIANT } from './constants';

export function showAccountModal(options?: {
  variant: ValueOf<typeof ACCOUNT_VARIANT>;
}) {
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
