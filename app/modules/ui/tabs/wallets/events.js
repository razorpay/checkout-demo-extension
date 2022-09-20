import { Events } from 'analytics';

const HOME_EVENTS = {
  SCREEN_LOAD: 'checkoutWalletScreenLoaded',
  SCREEN_LOAD_V2: '1cc_payments_wallet_screen_loaded',
  WALLET_SELECTED: '1cc_wallet_option_selected',
  PAYPAL_RENDERED: 'wallet:paypal:render',
};

//this function tracks event when paypal is shown to the user in wallets,
//function is being called in wallets/index.svelte
export function trackPaypalRendered(filteredWallets) {
  try {
    if (Array.isArray(filteredWallets)) {
      const isRendered = filteredWallets.some(
        (wallet) => wallet?.code === 'paypal'
      );
      if (isRendered) {
        Events.TrackRender(HOME_EVENTS.PAYPAL_RENDERED);
      }
    }
  } catch (e) {}
}

export default HOME_EVENTS;
