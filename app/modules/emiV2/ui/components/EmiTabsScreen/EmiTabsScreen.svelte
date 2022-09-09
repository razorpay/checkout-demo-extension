<script lang="ts">
  import { selectedPlan } from 'checkoutstore/emi';
  import CTAOld from 'ui/elements/CTA.svelte';
  import CTA from 'cta';
  import EmiTabs from './EmiTabs.svelte';
  import {
    cardlessEligibilityError,
    selectedInstrumentCardlessEligible,
  } from 'checkoutstore/screens/emi';
  import { locale, t } from 'svelte-i18n';
  import { TRY_ANOTHER_EMI_OPTION } from 'ui/labels/debit-emi';
  import { SELECT_PLAN } from 'ui/labels/emi';
  import { isRedesignV15 } from 'razorpay';
  import { getEmiTabs, isCardlessTab } from 'emiV2/helper/tabs';
  import { handleEmiProviderSelection } from 'emiV2/helper/emiTabs';
  import { isSelectedBankBajaj } from 'emiV2/helper/emiOptions';
  import { offerWindowOpen } from 'offers/store';
  import { onMount } from 'svelte';
  import type { Instrument, TabList } from 'emiV2/types';
  import { mode } from 'checkoutstore/screens/otp';

  export let currentMethod: Instrument;
  let tabs: TabList = [];

  $: {
    tabs = getEmiTabs(currentMethod, $locale);
  }

  const handleSelectPlan = () => {
    handleEmiProviderSelection();
  };

  onMount(() => {
    cardlessEligibilityError.set('');
    // setting otp mode to null to avoid any fallback otp UI
    mode.set('');
  });

  let isCtaDisabled = false;

  $: {
    isCtaDisabled = !$selectedPlan;

    if (
      isCardlessTab() &&
      !$selectedInstrumentCardlessEligible &&
      !isSelectedBankBajaj()
    ) {
      isCtaDisabled = true;
    }

    if ($cardlessEligibilityError && isCardlessTab()) {
      isCtaDisabled = false;
    }
  }

  let ctaLabel: string = SELECT_PLAN;

  $: {
    if ($cardlessEligibilityError) {
      ctaLabel = TRY_ANOTHER_EMI_OPTION;
    } else {
      ctaLabel = SELECT_PLAN;
    }
  }
</script>

<div class:one-cc={isRedesignV15()}>
  <EmiTabs {tabs} />
</div>
<CTA
  screen="emiPlans"
  tab="emi"
  showAmount={true}
  show={!$offerWindowOpen}
  disabled={isCtaDisabled}
  onSubmit={() => {
    handleSelectPlan();
  }}
  label={$t(ctaLabel)}
/>
{#if !isRedesignV15()}
  <CTAOld disabled={isCtaDisabled} on:click={handleSelectPlan}>
    {#if $cardlessEligibilityError}
      {$t(TRY_ANOTHER_EMI_OPTION)}
    {:else}
      {$t(SELECT_PLAN)}
    {/if}
  </CTAOld>
{/if}

<style>
  .one-cc {
    scroll-behavior: smooth;
    height: 100%;
  }
</style>
