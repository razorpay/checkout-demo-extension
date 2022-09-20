<script lang="ts">
  import {
    Tabs,
    TabList as TabHeader,
    Tab,
    TabPanel,
  } from 'components/Tabs/index';
  import EmiTabContent from './EmiTabContent.svelte';
  import { selectedBank } from 'emiV2/store';
  import {
    selectedInstrumentCardlessEligible,
    cardlessEligibilityError,
  } from 'emiV2/ui/components/EmiTabsScreen/store';
  import { selectedPlan } from 'checkoutstore/emi';
  import { isRedesignV15 } from 'razorpay';
  import type { TabList } from 'emiV2/types';
  import { trackEmiProviderSelected } from 'emiV2/events/tracker';
  import { onMount } from 'svelte';
  import {
    removeNoCostOffer,
    removeAppliedOfferForMethod,
  } from 'emiV2/helper/offers';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import { isCardlessTab } from 'emiV2/helper/tabs';
  import { t } from 'svelte-i18n';
  import { clearPaymentRequest } from 'emiV2/payment/prePaymentHandler';

  export let tabs: TabList = [];

  onMount(() => {
    // Track emi provider selected
    trackEmiProviderSelected({
      provider_name: $selectedBank?.name || 'NA',
      credit: $selectedBank?.creditEmi || false,
      debit: $selectedBank?.debitEmi || false,
      cardless: $selectedBank?.isCardless || false,
      debit_and_cardless: !!$selectedBank?.debitCardlessConfig,
      tab_view: tabs.length > 1,
      default_tab: tabs[0].value,
    });
  });

  let showTabs: boolean;
  $: {
    showTabs = tabs.length > 1;
    // $selectedTab = tabs[0].value;
  }

  const handleTabChange = () => {
    $selectedInstrumentCardlessEligible = false;
    $cardlessEligibilityError = '';
    $selectedPlan = null;
    removeNoCostOffer();
    removeAppliedOfferForMethod(isCardlessTab() ? 'cardless_emi' : 'emi');
    // if we switch from cardless to credt/debit tab
    // while a eligibility call has been made we need to cancel the existing request
    clearPaymentRequest();
  };
</script>

<div
  class:hide-tabs={!showTabs}
  class="tab-content screen collapsible"
  class:tab-content-one-cc={isRedesignV15()}
>
  <div class:screen-one-cc={isRedesignV15()}>
    <Tabs
      on:tab-change={() => {
        handleTabChange();
      }}
    >
      <TabHeader>
        {#each tabs as tab (tab)}
          <Tab {tab}>
            {$t(tab.label)}
          </Tab>
        {/each}
      </TabHeader>
      <!-- Tab Content -->
      <div class="emi-tab-panel-container">
        {#each tabs as tab (tab)}
          <TabPanel panel={tab}>
            <EmiTabContent isTabsShown={showTabs} />
          </TabPanel>
        {/each}
      </div>
    </Tabs>
    <AccountTab />
  </div>
</div>

<style>
  .tab-content {
    margin-top: 40px;
  }
  .tab-content-one-cc {
    margin-top: 0;
    height: 100%;
  }
  .emi-tab-panel-container {
    padding: 16px;
    margin-top: 8px;
  }
  .screen-one-cc {
    min-height: 100%;
    height: 100%;
  }
  :global(.hide-tabs .tab-list) {
    display: none !important;
  }
  :global(.hide-tabs .emi-tab-panel-item) {
    margin-top: 8px !important;
  }

  :global(.tabs) {
    height: max-content;
    min-height: 100%;
  }
</style>
