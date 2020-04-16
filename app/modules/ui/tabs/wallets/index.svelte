<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // Store Imports
  import { getWallets } from 'checkoutstore/methods';
  import { showCta } from 'checkoutstore/cta';
  import { methodTabInstrument } from 'checkoutstore/screens/home';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import * as WalletsData from 'common/wallet';

  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { scrollIntoView } from 'lib/utils';

  // Transitions
  import { slide } from 'svelte/transition';

  const session = getSession();
  const wallets = getWallets();

  const ua = navigator.userAgent;
  const ua_iPhone = /iPhone/.test(ua);

  export let selectedWallet = session.get('prefill.wallet') || null;

  let filteredWallets = wallets;
  $: {
    filteredWallets = filterWalletsAgainstInstrument(
      wallets,
      $methodTabInstrument
    );

    // If a wallet was selected and has been filtered out, deselect it
    if (
      selectedWallet &&
      !_Arr.any(filteredWallets, wallet => wallet.code === selectedWallet)
    ) {
      selectedWallet = null;
    }
  }

  /**
   * Filters wallets against the given instrument.
   * Only allows those wallets that match the given instruments.
   *
   * @param {Array<Wallet>} wallets
   * @param {Instrument} instrument
   *
   * @returns {Array<Wallet>}
   */
  function filterWalletsAgainstInstrument(wallets, instrument) {
    if (!instrument || instrument.method !== 'wallet') {
      return wallets;
    }

    if (!instrument.wallets) {
      return wallets;
    }

    let filtered = _Arr.filter(wallets, wallet =>
      _Arr.contains(instrument.wallets, wallet.code)
    );

    return filtered;
  }

  export function isAnyWalletSelected() {
    return !!selectedWallet;
  }

  const walletReferences = {};

  export function onWalletSelection(e, code) {
    const offerError = !session.validateOffers(code, function(removeOffer) {
      if (removeOffer) {
        selectedWallet = code;
      }
    });

    if (!offerError) {
      selectedWallet = code;
      showCta();
    }

    if (ua_iPhone) {
      window.Razorpay.sendMessage({ event: 'blur' });
    }

    Analytics.track('wallet:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: selectedWallet,
        power: WalletsData.isPowerWallet(selectedWallet),
      },
    });
  }

  export function onShown() {
    if (selectedWallet) {
      showCta();
      setTimeout(() => {
        scrollIntoView(walletReferences[selectedWallet]);
      }, 200);
    }
  }

  // Called when the user presses the pay button
  export function getPayload() {
    const payload = {
      wallet: selectedWallet,
    };

    /**
     * Wallets might need to go through intent flow too
     * TODO: Add a feature check here
     */
    const shouldTurnWalletToIntent = WalletsData.shouldTurnWalletToIntent(
      selectedWallet,
      session.upi_intents_data
    );

    if (shouldTurnWalletToIntent) {
      payload.upi_app = WalletsData.getPackageNameForWallet(selectedWallet);
    }

    return payload;
  }

  /**
   * @description get an applicable offer (if any)
   * @param {String} code Wallet code for the offer is needed
   */
  function getApplicableOffer(code) {
    return (
      session.walletOffer &&
      session.walletOffer.issuer === code &&
      session.walletOffer
    );
  }
</script>

<style>
  .border-list {
    margin: 0 -12px;
  }

  [slot='icon'].top {
    align-self: flex-start;
  }
</style>

<div class="border-list collapsable">
  {#each filteredWallets as wallet, i}
    <SlottedRadioOption
      name={wallet.code}
      selected={selectedWallet === wallet.code}
      align="top"
      on:click={e => onWalletSelection(e, wallet.code)}>
      <div
        slot="title"
        bind:this={walletReferences[wallet.code]}
        id={`wallet-radio-${wallet.code}`}>
        <span class="title">{wallet.name}</span>
      </div>
      <div slot="body">
        {#if selectedWallet === wallet.code}
          <div transition:slide={{ duration: 200 }}>
            {#if getApplicableOffer(wallet.code)}
              <span class="offer">{getApplicableOffer(wallet.code).name}</span>
              <div class="offer-info">
                {getApplicableOffer(wallet.code).display_text}
              </div>
            {/if}
          </div>
        {/if}
      </div>
      <i slot="icon" class="top">
        <Icon icon={wallet.sqLogo} />
      </i>
    </SlottedRadioOption>
  {/each}

</div>
