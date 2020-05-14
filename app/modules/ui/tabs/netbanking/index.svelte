<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  // Store
  import { selectedBank } from 'checkoutstore/screens/netbanking';
  import { methodTabInstrument } from 'checkoutstore/screens/home';

  import { t } from 'svelte-i18n';

  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import GridItem from 'ui/tabs/netbanking/GridItem.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import DowntimeCallout from 'ui/elements/DowntimeCallout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import BankSearchItem from 'ui/elements/search-item/Bank.svelte';

  // i18n labels
  import { NETBANKING_SELECT_LABEL, NETBANKING_SELECT_HELP } from 'ui/labels';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { iPhone } from 'common/useragent';
  import { getPreferredBanks } from 'common/bank';
  import { getDowntimes, isRecurring } from 'checkoutstore';
  import * as InputActions from 'actions/input';
  import {
    hasMultipleOptions,
    getRetailOption,
    getCorporateOption,
    isCorporateCode,
  } from 'common/bank';
  import { scrollIntoView } from 'lib/utils';
  import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';

  // Props
  export let banks;
  export let downtimes = getDowntimes();
  export let method;
  export let bankOptions;
  export let active = false;

  // Computed
  let filteredBanks = banks; // Always use this to get the banks
  let showCorporateRadio;
  let maxGridCount;
  let corporateSelected;
  let banksArr;
  let invalid;
  let netbanks;
  let selectedBankHasSevereDowntime;
  let selectedBankHasLowDowntime;
  let selectedBankHasDowntime;
  let selectedBankName;

  $: {
    if ($selectedBank) {
      selectedBankName = _Arr.find(
        banksArr,
        bank => bank.code === $selectedBank
      ).name;
    } else {
      selectedBankName = null;
    }
  }

  let isSearchOpened = false; // Is SearchModal opened?

  // Refs
  let radioContainer;
  let searchModal;

  // Actions
  const focus = InputActions.focus;
  const blur = InputActions.blur;
  const input = InputActions.input;

  const recurring = isRecurring();
  const dispatch = createEventDispatcher();

  function setCorporateOption() {
    const corporateOption = getCorporateOption($selectedBank, filteredBanks);

    if (corporateOption) {
      $selectedBank = corporateOption;
    }
  }

  function determineCtaVisibility() {
    // For emandate, the screen switches as soon as user selects a bank. We do not need to show the CTA
    // in that case.
    if (recurring) {
      hideCta();
    } else {
      showCtaWithDefaultText();
    }
  }

  export function onShown() {
    active = true;

    determineCtaVisibility();
  }

  function showSearch() {
    hideCta();
    searchModal.open();
    isSearchOpened = true;
  }

  function hideSearch() {
    searchModal.close();
    determineCtaVisibility();
    isSearchOpened = false;
  }

  export function onBack() {
    // Hide SearchModal if it is opened
    if (isSearchOpened) {
      hideSearch();

      return true;
    }

    active = false;
  }

  function setRetailOption() {
    const retailOption = getRetailOption($selectedBank, filteredBanks);
    if (retailOption) {
      $selectedBank = retailOption;
    }
  }

  /**
   * Filters banks against the given instrument.
   * Only allows those banks that match the given instruments.
   *
   * @param {Object} banks
   * @param {Instrument} instrument
   *
   * @returns {Object}
   */
  function filterBanksAgainstInstrument(banks, instrument) {
    if (!instrument || instrument.method !== method) {
      return banks;
    }

    if (!instrument.banks) {
      return banks;
    }

    let filteredBanks = {};

    _Arr.loop(instrument.banks, code => {
      if (banks[code]) {
        filteredBanks[code] = banks[code];
      }
    });

    return filteredBanks;
  }

  $: {
    filteredBanks = filterBanksAgainstInstrument(banks, $methodTabInstrument);

    // If the currently selected bank is not present in filtered banks, we need to unset it.
    if (!filteredBanks[$selectedBank]) {
      $selectedBank = '';
    }
  }

  $: showCorporateRadio =
    !recurring && hasMultipleOptions($selectedBank, filteredBanks);
  $: corporateSelected = isCorporateCode($selectedBank);
  $: maxGridCount = recurring ? 3 : 6;
  $: banksArr = _Arr.map(_Obj.entries(filteredBanks), entry => ({
    code: entry[0],
    name: entry[1],
    downtime: downtimes[entry[0]],
  }));
  $: invalid = method !== 'emandate' && !$selectedBank;
  $: netbanks = getPreferredBanks(filteredBanks, bankOptions).slice(
    0,
    maxGridCount
  );
  $: selectedBankHasSevereDowntime =
    method === 'netbanking' &&
    _Arr.contains(downtimes.high.banks, $selectedBank);
  $: selectedBankHasLowDowntime =
    method === 'netbanking' &&
    _Arr.contains(downtimes.low.banks, $selectedBank);
  $: selectedBankHasDowntime =
    selectedBankHasSevereDowntime || selectedBankHasLowDowntime;

  $: {
    const selected = corporateSelected;

    if (showCorporateRadio) {
      setTimeout(() => scrollIntoView(radioContainer), 300);
    }
  }

  $: {
    const bankCode = $selectedBank;

    if (iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }

    if (bankCode) {
      Analytics.track('bank:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          bank: bankCode,
        },
      });

      dispatch('bankSelected', {
        bank: {
          code: bankCode,
        },
      });
    }
  }
</script>

<style>
  #netb-banks {
    overflow: hidden;
  }

  .ref-radiocontainer {
    margin-top: -6px;
    margin-bottom: 18px;
  }

  .input-radio:first-of-type {
    margin-top: 4px;
  }

  .dropdown-like {
    width: 100%;
    text-align: start;
  }
</style>

<!-- TODO: remove override after fixing method check -->
<Tab
  method="netbanking"
  pad={false}
  overrideMethodCheck
  hasMessage={selectedBankHasDowntime}>
  <Screen pad={false}>
    <div>
      <div id="netb-banks" class="clear grid count-3">
        {#each netbanks as { name, code }}
          <GridItem
            {name}
            {code}
            fullName={filteredBanks[code]}
            bind:group={$selectedBank} />
        {/each}
      </div>

      <div class="elem-wrap pad" style="margin-bottom: 24px;">
        <div id="nb-elem" class="elem select" class:invalid>
          <i class="select-arrow"></i>
          <!-- LABEL: Please select a bank -->
          <div class="help">{$t(NETBANKING_SELECT_HELP)}</div>
          <button
            class="input dropdown-like"
            type="button"
            id="bank-select"
            on:click={showSearch}>
            {#if $selectedBank}
              {selectedBankName}
            {:else}{$t(NETBANKING_SELECT_LABEL)}{/if}
          </button>
        </div>
      </div>

      {#if showCorporateRadio}
        <div
          class="pad ref-radiocontainer"
          bind:this={radioContainer}
          transition:fade={{ duration: 100 }}>
          <label>Complete Payment Using</label>
          <div class="input-radio">
            <input
              type="radio"
              id="nb_type_retail"
              value="retail"
              checked={!corporateSelected}
              on:click={setRetailOption} />
            <label for="nb_type_retail">
              <div class="radio-display" />
              <div class="label-content">Retail</div>
            </label>
          </div>
          <div class="input-radio">
            <input
              type="radio"
              id="nb_type_corporate"
              value="corporate"
              checked={corporateSelected}
              on:click={setCorporateOption} />
            <label for="nb_type_corporate">
              <div class="radio-display" />
              <div class="label-content">Corporate</div>
            </label>
          </div>
        </div>
      {/if}
    </div>

    <SearchModal
      title="Select Bank to Pay"
      placeholder="Search for bank"
      items={banksArr}
      keys={['code', 'name']}
      component={BankSearchItem}
      bind:this={searchModal}
      on:close={hideSearch}
      on:select={({ detail }) => {
        $selectedBank = detail.code;
        hideSearch();
      }} />

    <Bottom tab="netbanking">
      <!-- Show recurring message for recurring payments -->
      {#if recurring}
        <Callout>
          Future payments from your bank account will be charged automatically.
        </Callout>
      {/if}

      <!-- Show downtime message if the selected bank is down -->
      {#if selectedBankHasDowntime}
        <DowntimeCallout severe={selectedBankHasSevereDowntime}>
          {#if selectedBankHasSevereDowntime}
            <strong>{filteredBanks[$selectedBank]}</strong>
            accounts are temporarily unavailable right now. Please select
            another bank.
          {:else}
            <strong>{filteredBanks[$selectedBank]}</strong>
            accounts are experiencing low success rates.
          {/if}
        </DowntimeCallout>
      {/if}
    </Bottom>

  </Screen>
</Tab>
