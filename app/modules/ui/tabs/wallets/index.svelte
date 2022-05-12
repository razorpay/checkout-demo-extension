<script lang="ts">
  // Svelte Imports
  import { onDestroy } from 'svelte';

  // Store Imports
  import { getWallets } from 'checkoutstore/methods';
  import { showCta, hideCta } from 'checkoutstore/cta';
  import { methodInstrument } from 'checkoutstore/screens/home';
  import { selectedWallet } from 'checkoutstore/screens/wallet';
  import { isDynamicWalletFlow } from 'wallet/helper';
  import { isOneClickCheckout } from 'razorpay';

  // i18n
  import { getWalletName, getWalletSubtitle } from 'i18n';
  import { locale, t } from 'svelte-i18n';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics, { Events } from 'analytics';
  import WALLET_EVENTS from 'ui/tabs/wallets/events';
  import * as AnalyticsTypes from 'analytics-types';
  import * as WalletsData from 'common/wallet';
  import { getAnimationOptions } from 'svelte-utils';
  import { isShowAccountTab } from 'one_click_checkout/account_modal/helper';

  //UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import CTAOneCC from 'one_click_checkout/cta/index.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { scrollIntoView } from 'lib/utils';
  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';

  // Transitions
  import { slide } from 'svelte/transition';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';

  // Constant imports
  import { PAY_NOW_CTA_LABEL } from 'one_click_checkout/cta/i18n';

  const session = getSession();
  const wallets = getWallets();

  const ua = navigator.userAgent;
  const ua_iPhone = /iPhone/.test(ua);

  let filteredWallets = wallets;
  let renderCtaOneCC = false;
  let walletEle;
  let showAccountTab;

  const isOneCCEnabled = isOneClickCheckout();
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
      showCta();
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
      renderCtaOneCC = true;
      showCta();
      setTimeout(() => {
        scrollIntoView(walletReferences[$selectedWallet]);
      }, 200);
    } else {
      renderCtaOneCC = false;
      hideCta();
    }
  }

  export function onHide() {
    renderCtaOneCC = false;
  }

  $: renderCtaOneCC = !!$selectedWallet;

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

  function onSubmit() {
    session.preSubmit();
    renderCtaOneCC = false;
  }

  onDestroy(() => {
    renderCtaOneCC = false;
  });

  function onScroll() {
    showAccountTab = isShowAccountTab(walletEle);
  }
</script>

<Tab method="wallet" pad={false}>
  <div
    class="wallet-wrapper"
    bind:this={walletEle}
    on:scroll={onScroll}
    class:wallet-one-cc={isOneCCEnabled}
  >
    <div class="border-list collapsable" class:screen-one-cc={isOneCCEnabled}>
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
    <AccountTab {showAccountTab} />
  </div>
  <Bottom tab="wallet">
    <!-- skip dcc check as paypal 1cc doesn't depend upon dcc -->
    {#if $selectedWallet === 'paypal' && !isOneCCEnabled}
      <DynamicCurrencyView tabVisible view={$selectedWallet} />
    {/if}
  </Bottom>
  {#if renderCtaOneCC}
    <CTAOneCC on:click={onSubmit}>
      {$t(PAY_NOW_CTA_LABEL)}
    </CTAOneCC>
  {/if}
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

  .wallet-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .wallet-one-cc {
    overflow: auto;
  }
  .screen-one-cc {
    min-height: 120%;
  }

  :global(#content.one-cc) .border-list {
    margin: 26px 16px 12px;
  }
</style>
