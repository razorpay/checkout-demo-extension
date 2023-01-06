<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import {
    selectedCardlessEmiProvider,
    emiMethod,
    selectedBank,
    getSelectedEmiBank,
  } from 'emiV2/store';
  import { selectedInstrumentCardlessEligible } from 'emiV2/ui/components/EmiTabsScreen/store';
  import { getBankAndOtherEMIOptions } from 'emiV2/helper/emiOptions';
  import {
    getEMIStartingAt,
    isNoCostAVailableForToken,
  } from 'emiV2/helper/label';
  import EmiGridSection from 'emiV2/ui/components/EMIGridOptions/EmiGridSection.svelte';
  import CTAOld from 'ui/elements/CTA.svelte';
  import { t } from 'svelte-i18n';
  import { EMI_CTA_LABEL } from 'ui/labels/emi';
  import { getDiscountedAmount } from 'offers/helper';
  import SavedCards from 'emiV2/ui/components/Cards/SavedCards.svelte';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { customer } from 'checkoutstore/customer';
  import { blocks, selectedInstrument } from 'checkoutstore/screens/home';
  import CTA from 'cta';
  import { isRedesignV15 } from 'razorpay';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

  import type {
    Tokens,
    Instrument,
    EMIOptionsMap,
    EMIBANKS,
  } from 'emiV2/types';
  import { cardlessTabProviders } from 'emiV2/constants';
  import { sortBasedOnTokenization } from 'ui/tabs/card/utils';
  import { getSession } from 'sessionmanager';
  import { screenStore } from 'checkoutstore';
  import { pushStack } from 'navstack';
  import EmiTabScreenSvelte from 'emiV2/ui/components/EmiTabsScreen/EmiTabsScreen.svelte';
  import { handleEmiPaymentV2 } from 'emiV2/payment';
  import { emiOptionsRendered } from 'emiV2/events/tracker';
  import Analytics from 'analytics';
  import { timer } from 'utils/timer';
  import {
    appliedOffer,
    offerErrorViewOpen,
    offerWindowOpen,
  } from 'offers/store';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { clearPaymentRequest } from 'emiV2/payment/prePaymentHandler';
  import { filterSavedCardsAgainstCustomBlock } from 'emiV2/helper/configurability';
  import { getSavedCardsForEMI } from 'emiV2/helper/card';
  import { selectedPlan } from 'checkoutstore/emi';
  import { shouldEmiOptionRender } from 'emiV2/helper/helper';
  import { handleBackNavigation } from 'emiV2/helper/navigation';
  import { triggerAnalyticsOnShown } from 'emiV2/events/helpers';
  import { selectEmiInstrumentForOffer } from 'emiV2/helper/offers';

  let emiOptions: EMIOptionsMap = {};
  let savedCards: Tokens[] = [];
  let allSavedCards: Tokens[] = [];
  let currentInstrumentMethod: Instrument;

  onMount(() => {
    const discountedAmount: number = getDiscountedAmount();
    currentInstrumentMethod = getCustomBlockInstrument();
    emiOptions = getBankAndOtherEMIOptions(
      discountedAmount,
      currentInstrumentMethod
    );
    triggerAnalyticsOnShown(emiOptions);
    // Set selected tab as null when user lands on the L1 screen
    // From further screens
    selectedTab.set('');
    // Clearing the selected plan after the user lands on L1 screen
    selectedPlan.set(null);
  });

  // Putting a manual check to verify for a custom block because on navstack redirection
  // the instrument.section is getting lost
  const getCustomBlockInstrument = () => {
    const block = $blocks.find(
      (block) =>
        block.instruments.includes($selectedInstrument) &&
        block.code !== 'rzp.preferred' &&
        block.code !== 'rzp.cluster'
    );

    if (block && block.code) {
      return $selectedInstrument;
    }
  };

  let sections: string[];
  $: sections = Object.keys(emiOptions);

  $: {
    allSavedCards = getSavedCardsForEMI($customer);
  }

  function filterSavedCardsForEmi(tokens: Tokens[]) {
    const parsedTokens = tokens
      .filter((token) => token.plans)
      .map((token) => {
        return {
          ...token,
          card: {
            ...token.card,
            isNoCostEMI: isNoCostAVailableForToken(token.plans),
            startingFrom: getEMIStartingAt(token.plans),
          },
        };
      });
    return parsedTokens;
  }

  $: {
    let _savedCards: Tokens[] = filterSavedCardsForEmi(allSavedCards);
    _savedCards = filterSavedCardsAgainstCustomBlock(
      _savedCards,
      currentInstrumentMethod
    );
    savedCards = sortBasedOnTokenization(_savedCards);

    // Track saved cards
    const trackMeta = savedCards.map((card) => ({
      card_type: card.card.type,
      card_network: card.card.network,
      card_issuer: card.card.issuer,
    }));

    const bankEmiProviders = Array.isArray(emiOptions.bank)
      ? emiOptions.bank.slice(0, 5)
      : [];
    const otherEmiProviders = emiOptions.other || [];
    // Track EMI Providers rendered
    const emiOptionsMeta = {
      emiOptions:
        emiOptions && Object.keys(emiOptions).length
          ? [...bankEmiProviders, ...otherEmiProviders]
          : [],
      savedCards: trackMeta,
    };
    if (shouldEmiOptionRender(emiOptions, savedCards)) {
      emiOptionsRendered(emiOptionsMeta);
    }
  }

  /**
   * Function to decide action upon emi provider selection
   * Redirects to Tabs screen if emi option is bank
   * Or if emi option is providers like HomeCredit or Bajaj etc
   * Else if emi is a cardless provider -> Start the payment
   * @returns
   */
  const selectEMIProvider = (currentInstrumentMethod: Instrument) => {
    const session = getSession();
    const selectedBankCode: EMIBANKS | null = getSelectedEmiBank();
    if (selectedBankCode && selectedBankCode.code) {
      // If selected provider is a bank or belongs to cardless list
      // Redirect to Tabs screen

      if (
        $emiMethod === 'bank' ||
        cardlessTabProviders.includes(selectedBankCode.code)
      ) {
        selectedInstrumentCardlessEligible.set(false);
        const nextScreen = 'emiPlans';
        // Track screen change event since we are manually setting screen
        Analytics.track('screen:switch', {
          data: {
            from: session.screen || '',
            to: nextScreen || '',
          },
        });
        Analytics.setMeta('screen', screen);
        const getDuration = timer();
        Analytics.setMeta('timeSince.screen', getDuration());

        session.screen = nextScreen;
        screenStore.set(nextScreen);
        pushStack({
          component: EmiTabScreenSvelte,
          props: {
            currentMethod: currentInstrumentMethod,
          },
        });
        return;
      }

      // Check for any existing payment request
      // if the user has checked eligibility but going ahead with a different option
      // we need to cancel the payment and then
      // Initiate the cardless payment
      selectedCardlessEmiProvider.set(selectedBankCode.code);

      clearPaymentRequest();

      handleEmiPaymentV2({
        action: 'cardless',
        payloadData: {
          provider: selectedBankCode.code,
        },
      });
    }
  };

  const handleSelectEMIProvider = () => {
    selectEMIProvider(currentInstrumentMethod);
  };

  const isRedesignV15Enabled = isRedesignV15();

  export function preventBack() {
    handleBackNavigation();
    return false;
  }

  $: {
    // If an offer is applied on a specific issuer say HDFC credit
    // Or if network specific offer is there for Amex
    // select the corresponding emi provider
    if (
      $appliedOffer &&
      ($appliedOffer.issuer || $appliedOffer?.payment_network)
    ) {
      selectEmiInstrumentForOffer(emiOptions);
    }
  }
  let onScreenContainerElement: HTMLDivElement;
  let onScreenContentElement: HTMLDivElement;
  let onScreenContainerOpacity;
  afterUpdate(() => {
    onScreenContainerElement = document.getElementById('root');
    onScreenContainerOpacity = window.getComputedStyle(
      onScreenContainerElement
    ).opacity;
  });
</script>

<div
  class:tab-content-one-cc={isRedesignV15Enabled}
  class="tab-content screen collapsible"
  class:screen-one-cc={isRedesignV15Enabled}
>
  <div bind:this={onScreenContentElement}>
    {#if savedCards && savedCards.length > 0}
      <div class="saved-emi-cards-container">
        <SavedCards cards={savedCards} />
      </div>
    {/if}
    <EmiGridSection
      {sections}
      {emiOptions}
      on:select={() => {
        handleSelectEMIProvider();
      }}
    />
  </div>
</div>
<AccountTab
  {onScreenContainerOpacity}
  {onScreenContentElement}
  {onScreenContainerElement}
/>

<!-- 
  Hide the CTA if offer window is open or offer error overlay is in view 
  As with navtstack both offer CTA and screen CTA are coming into view
-->
<CTA
  screen="emi"
  tab="emi"
  showAmount={true}
  show={$offerWindowOpen || $offerErrorViewOpen ? false : true}
  disabled={(!$selectedBank || !$selectedBank.code) && !$selectedCard}
  onSubmit={() => {
    handleSelectEMIProvider();
  }}
  label={$t(EMI_CTA_LABEL)}
/>
{#if !isRedesignV15Enabled}
  <CTAOld
    disabled={(!$selectedBank || !$selectedBank.code) && !$selectedCard}
    on:click={() => {
      handleSelectEMIProvider();
    }}
  >
    {$t(EMI_CTA_LABEL)}
  </CTAOld>
{/if}

<style>
  .tab-content {
    overflow-y: scroll;
  }
  .tab-content-one-cc {
    margin-top: 0;
  }
  .saved-emi-cards-container {
    padding: 16px 14px;
    padding-bottom: 8px;
  }
</style>
