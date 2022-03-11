import AccountModal from 'one_click_checkout/account_modal/ui/AccountModal.svelte';

let modal;

/**
 * Creates a new Account modal
 */
function create() {
  modal = new AccountModal({
    target: document.getElementById('one-cc-account'),
  });
}

export function showAccountModal() {
  if (!modal) {
    create();
  }
  modal.show();
}
