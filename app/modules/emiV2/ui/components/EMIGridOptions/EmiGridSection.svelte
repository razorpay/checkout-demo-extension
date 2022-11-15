<script lang="ts">
  import { emiMethod, selectedBank } from 'emiV2/store';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { createEventDispatcher } from 'svelte';
  import { t } from 'svelte-i18n';
  import {
    BANK_EMI_OPTIONS,
    OTHER_EMI_OPTIONS,
    MORE_BANKS_LABEL,
  } from 'ui/labels/cardlessemi';
  import EmiOptionGridItem from './EmiGridOptionItem.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import triggerSearchModal from 'components/SearchModal';
  import BankSearchItem from 'ui/elements/search-item/EmiBank.svelte';
  import { sortBankByName } from 'emiV2/helper/emiOptions';
  import type { EMIOptionsMap, EMIBANKS, EMICategories } from 'emiV2/types';
  import {
    selectedDifferentBank,
    trackDifferentBankSelected,
  } from 'emiV2/events/tracker';
  import { removeAppliedOfferForMethod } from 'emiV2/helper/offers';
  import { triggerAnalyticsOnSelect } from 'emiV2/events/helpers';
  import { getSession } from 'sessionmanager';

  export let sections: string[];
  export let emiOptions: EMIOptionsMap;

  const session = getSession();

  const dispatch = createEventDispatcher();

  const spliceVal = (providerType: string) => {
    if (providerType === 'bank') {
      return 5;
    }
    return emiOptions[providerType].length;
  };

  let sectionTitle: EMICategories = {
    bank: BANK_EMI_OPTIONS,
    other: OTHER_EMI_OPTIONS,
  };
  // Internal state variable to handle the bank change

  const onEmiOptionSelect = (bank: EMIBANKS, emiProviderType: string) => {
    triggerAnalyticsOnSelect(bank, emiProviderType);
     // If applied offer is invalid show offer error overlay
    // If user continues without offer or there is no offer error set the respective stores.
    const offerError = !session.validateOffers(
      bank.code,
      function (removeOffer: boolean) {
        if (removeOffer) {
          $selectedBank = bank;
          $selectedCard = null;
          $emiMethod = emiProviderType;
        }
      }
    );

    if (!offerError) {
      // When a bank emi is selected we need to clear the saved card selection
      $selectedBank = bank;
      $selectedCard = null;
      $emiMethod = emiProviderType;
    }

    // remove applied offer
    // in case the selected provider does not match the offer method
    if (bank && bank.method) {
      removeAppliedOfferForMethod(bank.method);
    }
  };

  const showSearchModal = () => {
    // Track More banks click
    selectedDifferentBank();

    triggerSearchModal({
      identifier: 'emi_bank_select',
      placeholder: 'Search All banks',
      all: 'Search all',
      items: sortBankByName(emiOptions['bank']),
      keys: ['code', 'name'],
      component: BankSearchItem,
      onSelect: (data: EMIBANKS) => {
        // Track selected bank
        trackDifferentBankSelected({
          name: data.name || 'NA',
          nc_emi_tag: !!data.isNoCostEMI,
          interest_rate_tag: !!data.startingFrom,
        });
        onEmiOptionSelect(data, 'bank');
        dispatch('select');
      },
    });
  };
</script>

<div class="emi-wrapper">
  {#each sections as providerSection (providerSection)}
    {#if emiOptions[providerSection].length > 0}
      <div class="emi-provider-section">
        <h3 class="emi-header">
          {$t(sectionTitle[providerSection])}
        </h3>
        <div class="emi-section-grid clear grid count-3">
          {#each emiOptions[providerSection].slice(0, spliceVal(providerSection)) as provider (provider.code)}
            <EmiOptionGridItem
              type={providerSection}
              emi={provider}
              selected={!$selectedCard &&
                $selectedBank?.code.toLowerCase() ===
                  provider.code.toLowerCase()}
              on:click={() => {
                onEmiOptionSelect(provider, providerSection);
              }}
            />
          {/each}
          {#if providerSection === 'bank' && emiOptions[providerSection].length > 5}
            <div class="emi-bank item has-tooltip" on:click={showSearchModal}>
              <div class="emi-bank-item">
                <div class="more-bank-icon">
                  <span class="arrow-right">&#xe604;</span>
                </div>
                <div class="more-banks-label">
                  {$t(MORE_BANKS_LABEL)}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    <!-- Todo: Replace the downtime component logic to show only when downtime is there -->
    {#if $selectedBank && $selectedBank.code && providerSection === 'bank' && $selectedBank.downtimeConfig?.severe}
      <div class="downtime-container">
        <DowntimeCallout
          severe={$selectedBank.downtimeConfig?.severe}
          showIcon={true}
          downtimeInstrument={$selectedBank.downtimeConfig?.downtimeInstrument}
        />
      </div>
    {/if}
  {/each}
</div>

<style>
  .emi-wrapper {
    padding: 24px 14px;
  }
  .emi-provider-section {
    margin-bottom: 24px;
  }
  .emi-section-grid {
    padding-top: 1px;
    padding-left: 1px;
    display: flex;
    flex-wrap: wrap;
  }
  .emi-header {
    color: #263a4a;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    margin-top: 0;
    text-transform: none;
  }
  .emi-bank {
    overflow: hidden;
    border: 1px solid #ebedf0;
    margin-top: -1px;
    margin-left: -1px;
    height: auto;
    min-height: 94px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .more-banks-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
  }
  .more-bank-icon {
    border-radius: 4px;
    background-color: #eee;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-bottom: 8px;
    width: 36px;
    height: 36px;
    position: relative;
  }
  .arrow-right {
    transform: rotate(180deg);
    color: #3495fc;
    position: absolute;
    left: 28%;
    top: 28%;
  }
  .downtime-container {
    margin-bottom: 24px;
  }
</style>
