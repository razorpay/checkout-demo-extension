<script lang="ts">
  import { onMount } from 'svelte';
  import Emiplans from 'emiV2/ui/components/EmiPlans/EmiPlanCards.svelte';
  import PhoneNumber from './PhoneNumber.svelte';
  import {
    cardlessEligibilityError,
    selectedInstrumentCardlessEligible,
    selectedBank,
  } from 'checkoutstore/screens/emi';
  import { isRedesignV15 } from 'razorpay';
  import { isSelectedBankBajaj } from 'emiV2/helper/emiOptions';
  import { isCardlessTab } from 'emiV2/helper/tabs';
  import { tabLabels } from 'emiV2/constants';
  import { checkEligibility } from 'emiV2/helper/eligibility';
  import { trackEmiTabChange } from 'emiV2/events/tracker';
  import { selectedTab } from 'components/Tabs/tabStore';
  import type { EmiTabMeta } from 'emiV2/types';
  import { locale, t } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { CREDIT_DEBIT_CARD } from 'ui/labels/card';

  // Since for Bajaj also we are showing this screen to render emi plans
  // Therefore we need to check for tab to be cardless and provider to not be Bajaj
  // To Avoid eligibility call and phone number component
  const isPureCardlessScreen = isCardlessTab() && !isSelectedBankBajaj();

  onMount(() => {
    // Make a mobile number eligibility check for cardless emi
    // If it's not a bajaj emi option
    if (isPureCardlessScreen) {
      $cardlessEligibilityError = '';
      checkEligibility();
    }
  });

  $: {
    // Track tab switch event
    const tabChangeMeta: EmiTabMeta = {
      provider_name: $selectedBank?.name || 'NA',
      tab_name: $selectedTab,
    };

    if (isPureCardlessScreen) {
      tabChangeMeta.eligible = $selectedInstrumentCardlessEligible;
    }

    trackEmiTabChange(tabChangeMeta);
  }

  export let isTabsShown = true;
</script>

<div class="emi-tab-content">
  <!-- If only a single tab is shown for either credit or debit we show the tab name -->
  {#if !isTabsShown && !isCardlessTab()}
    <p class="card-type-label">
      {formatTemplateWithLocale(
        CREDIT_DEBIT_CARD,
        {
          type: $t(tabLabels[$selectedTab]),
        },
        $locale
      )}
    </p>
  {/if}
  <div
    class="emi-tab-panel-item"
    class:emi-tab-panel-item-onecc={isRedesignV15()}
  >
    {#if isPureCardlessScreen}
      <!-- Change the input field with new redesigned input -->
      <PhoneNumber />
    {/if}
    <!-- Show EMI Plans for debit and credit and for cardless only when user is eligible -->
    {#if !isCardlessTab() || isSelectedBankBajaj() || (isCardlessTab() && $selectedInstrumentCardlessEligible)}
      <Emiplans />
    {/if}
  </div>
</div>

<style>
  .emi-tab-panel-item {
    margin-top: 44px;
  }
  .emi-tab-panel-item-onecc {
    margin-top: 0px;
  }
  .card-type-label {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 16px;
  }
</style>
