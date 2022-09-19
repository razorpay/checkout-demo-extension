<script lang="ts">
  // Store Imports
  import { getWallets } from 'checkoutstore/methods';
  import CTA, { showCta, hideCta } from 'cta';
  import { methodInstrument } from 'checkoutstore/screens/home';
  import { selectedWallet } from 'checkoutstore/screens/wallet';
  import { isDynamicWalletFlow, showPowerWallet } from 'wallet/helper';
  import { isOneClickCheckout, isRedesignV15 } from 'razorpay';

  // i18n
  import { getWalletName, getWalletSubtitle } from 'i18n';
  import { locale, t } from 'svelte-i18n';
  import { testid } from 'tests/autogen';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics, { Events } from 'analytics';
  import WALLET_EVENTS from 'ui/tabs/wallets/events';
  import * as AnalyticsTypes from 'analytics-types';
  import * as WalletsData from 'common/wallet';
  import { getAnimationOptions } from 'svelte-utils';

  //UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { scrollIntoView } from 'lib/utils';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

  // Transitions
  import { slide } from 'svelte/transition';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import { SELECT_WALLET } from 'wallet/i18n/label';

  const session = getSession();
  const wallets = getWallets();

  /**
   * consumed by redesign CTA online
   */
  let CTAState = {
    show: true,
    disabled: true,
  };

  const ua = navigator.userAgent;
  const ua_iPhone = /iPhone/.test(ua);

  let filteredWallets = wallets;

  const isRedesignV15Enabled = isRedesignV15();
  $: {
    filteredWallets = filterWalletsAgainstInstrument(
      wallets,
      $methodInstrument
    );

    // If a wallet was selected and has been filtered out, deselect it
    if (
      $selectedWallet &&
      !filteredWallets.some((wallet) => wallet.code === $selectedWallet)
    ) {
      $selectedWallet = null;
    }

    /**
     * If there's only one wallet available,
     * select it automatically to reduce a user click.
     * Of course, do this only when there's nothing preselected.
     */
    if (!$selectedWallet && filteredWallets.length === 1) {
      onWalletSelection(filteredWallets[0].code);
    }

    filteredWallets = filteredWallets.filter((wallet) =>
      showPowerWallet(String(wallet.code))
    );
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

    let filtered = wallets.filter((wallet) =>
      instrument.wallets.includes(wallet.code)
    );

    return filtered;
  }

  export function isAnyWalletSelected() {
    return !!$selectedWallet;
  }

  const walletReferences: any = {};

  export function onWalletSelection(code) {
    Events.TrackBehav(WALLET_EVENTS.WALLET_SELECTED, {
      wallet_option_selected: code,
    });
    const offerError = !session.validateOffers(code, function (removeOffer) {
      if (removeOffer) {
        $selectedWallet = code;
      }
    });

    if (!offerError) {
      $selectedWallet = code;
      showCta(true);
      CTAState.show = true;
      CTAState.disabled = false;
    }

    if (ua_iPhone) {
      window.Razorpay.sendMessage({ event: 'blur' });
    }

    Analytics.track('wallet:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: $selectedWallet,
        power: !isDynamicWalletFlow()
          ? WalletsData.isPowerWallet($selectedWallet)
          : false,
      },
    });
  }

  export function onShown() {
    Analytics.track(WALLET_EVENTS.SCREEN_LOAD);
    Events.TrackRender(WALLET_EVENTS.SCREEN_LOAD_V2);
    if ($selectedWallet) {
      showCta(true);
      CTAState.show = true;
      CTAState.disabled = false;
      setTimeout(() => {
        scrollIntoView(walletReferences[$selectedWallet]);
      }, 200);
    } else {
      hideCta();
    }
  }

  // Called when the user presses the pay button
  export function getPayload() {
    const payload = {
      wallet: $selectedWallet,
    };

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

<Tab method="wallet" pad={false}>
  <div class="wallet-wrapper" class:wallet-one-cc={isRedesignV15Enabled}>
    {#if isRedesignV15Enabled}
      <h3 class="header-title">{$t(SELECT_WALLET)}</h3>
    {/if}
    <div class="border-list collapsable">
      {#each filteredWallets as wallet, i (wallet.code)}
        <SlottedRadioOption
          name={wallet.code}
          selected={$selectedWallet === wallet.code}
          align="top"
          on:click={() => onWalletSelection(wallet.code)}
        >
          <div
            class="title-container"
            slot="title"
            bind:this={walletReferences[wallet.code]}
            id={`wallet-radio-${wallet.code}`}
            {...!i && testid('click', 'wallet', wallet.code)}
          >
            <span class="title">{getWalletName(wallet.code, $locale)}</span>
            <span class="subtitle"
              >{getWalletSubtitle(wallet.code, $locale)}</span
            >
          </div>
          <div slot="body">
            {#if $selectedWallet === wallet.code}
              <div transition:slide={getAnimationOptions({ duration: 200 })}>
                {#if getApplicableOffer(wallet.code)}
                  <span class="offer">
                    {getApplicableOffer(wallet.code).name}
                  </span>
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
  </div>
  <AccountTab />
  <CTA
    screen="wallet"
    tab="wallet"
    disabled={CTAState.disabled}
    show={CTAState.show}
  />
  <Bottom tab="wallet">
    <!-- skip dcc check as paypal 1cc doesn't depend upon dcc -->
    {#if $selectedWallet === 'paypal' && !isOneClickCheckout()}
      <DynamicCurrencyView tabVisible view={$selectedWallet} />
    {/if}
  </Bottom>
</Tab>

<style>
  .border-list {
    margin: 12px;
  }

  [slot='icon'].top {
    align-self: flex-start;
  }

  .title-container {
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: 10px;
  }

  .wallet-one-cc .subtitle {
    color: var(--tertiary-text-color);
  }
  .subtitle:empty {
    display: none;
  }

  .wallet-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .wallet-one-cc {
    height: auto;
    min-height: 100%;
  }

  :global(#content.one-cc) .border-list {
    margin: 0px 16px 12px;
  }

  .header-title {
    margin: 20px 18px 14px;
    text-transform: capitalize;
    color: #263a4a;
    font-size: 14px;
    font-weight: 600;
  }
</style>
