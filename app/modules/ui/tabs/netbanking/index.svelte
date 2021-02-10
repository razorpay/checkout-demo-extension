<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';

  // Store
  import {
    selectedBank,
    hiddenBanksUsingConfig,
  } from 'checkoutstore/screens/netbanking';
  import { methodInstrument } from 'checkoutstore/screens/home';

  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import GridItem from 'ui/tabs/netbanking/GridItem.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import BankSearchItem from 'ui/elements/search-item/Bank.svelte';
  import CTA from 'ui/elements/CTA.svelte';

  // i18n
  import {
    NETBANKING_SELECT_LABEL,
    NETBANKING_SELECT_HELP,
    CORPORATE_RADIO_LABEL,
    RETAIL_RADIO_LABEL,
    SELECTION_RADIO_TEXT,
    SEARCH_TITLE,
    SEARCH_PLACEHOLDER,
    SEARCH_ALL,
    DOWNTIME_LOW_CALLOUT,
    DOWNTIME_HIGH_CALLOUT,
    DOWNTIME_MEDIUM_CALLOUT,
    RECURRING_CALLOUT,
  } from 'ui/labels/netbanking';

  import { t, locale } from 'svelte-i18n';

  import {
    getShortBankName,
    getLongBankName,
    formatTemplateWithLocale,
  } from 'i18n';

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
  import { getSession } from 'sessionmanager';
  import { getAnimationOptions } from 'svelte-utils';

  // Props
  export let banks;
  export let downtimes = getDowntimes();
  export let method;
  export let bankOptions;

  // Computed
  let filteredBanks = banks; // Always use this to get the banks
  let showCorporateRadio;
  let maxGridCount;
  let corporateSelected;
  let banksArr;
  let invalid;
  let netbanks;
  let selectedBankDowntimeSeverity = false;
  let downtimeText = '';
  let selectedBankHasDowntime;
  let selectedBankName;
  let translatedBanksArr;

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

  // State
  let searchModalOpen = false;

  // Refs
  let radioContainer;
  let bankSelect;

  // Actions
  const focus = InputActions.focus;
  const blur = InputActions.blur;
  const input = InputActions.input;

  const recurring = isRecurring();
  const dispatch = createEventDispatcher();

  export function getPayload() {
    return {
      bank: $selectedBank,
    };
  }

  function setCorporateOption() {
    const corporateOption = getCorporateOption($selectedBank, filteredBanks);

    if (corporateOption) {
      $selectedBank = corporateOption;
    }
  }

  function showSearch() {
    searchModalOpen = true;
  }

  function hideSearch() {
    searchModalOpen = false;

    // Restore focus
    if (bankSelect) {
      bankSelect.focus();
    }
  }

  /**
   * Handle when the user presses Enter while focused
   * on button#bank-select
   */
  function handleEnterOnButton(event) {
    // 13 = Enter
    if (_.getKeyFromEvent(event) === 13) {
      event.preventDefault();

      getSession().preSubmit();
    }
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

  function filterHiddenBanksUsingConfig(banks, hiddenBanks) {
    banks = _Obj.clone(banks);
    hiddenBanks.forEach(hiddenBank => {
      delete banks[hiddenBank];
    });

    return banks;
  }

  $: {
    filteredBanks = filterBanksAgainstInstrument(banks, $methodInstrument);

    filteredBanks = filterHiddenBanksUsingConfig(
      filteredBanks,
      $hiddenBanksUsingConfig
    );

    // If the currently selected bank is not present in filtered banks, we need to unset it.
    if (!filteredBanks[$selectedBank]) {
      $selectedBank = '';
    }

    /**
     * If the method is netbanking and if there's only
     * one bank available, select it automatically to reduce a user click.
     * Of course, do this only when there's nothing preselected.
     */
    const banksList = _Obj.keys(filteredBanks);
    if (method === 'netbanking' && !$selectedBank && banksList.length === 1) {
      $selectedBank = banksList[0];
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
  $: translatedBanksArr = _Arr.map(banksArr, bank => ({
    code: bank.code,
    original: bank.name,
    name: getLongBankName(bank.code, $locale, bank.name),
    _key: bank.code,
  }));
  $: invalid = method !== 'emandate' && !$selectedBank;
  $: netbanks = getPreferredBanks(filteredBanks, bankOptions).slice(
    0,
    maxGridCount
  );

  $: {
    if (method === 'netbanking') {
      if (_Arr.contains(downtimes.high.banks, $selectedBank)) {
        selectedBankDowntimeSeverity = 'high';
        selectedBankHasDowntime = true;
        downtimeText = DOWNTIME_HIGH_CALLOUT;
      } else if (_Arr.contains(downtimes.medium.banks, $selectedBank)) {
        selectedBankDowntimeSeverity = 'medium';
        selectedBankHasDowntime = true;
        downtimeText = DOWNTIME_MEDIUM_CALLOUT;
      } else if (_Arr.contains(downtimes.low.banks, $selectedBank)) {
        selectedBankDowntimeSeverity = 'low';
        selectedBankHasDowntime = true;
        downtimeText = DOWNTIME_LOW_CALLOUT;
      } else {
        selectedBankDowntimeSeverity = '';
        selectedBankHasDowntime = false;
      }
    }
  }

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

    /* Fallback for IE */
    text-align: left;
    text-align: start;
  }
  .dropdown-bank {
    display: flex;
    justify-content: space-between;
    width: 90%;
  }

  #bank-select {
    padding-top: 0;
    margin-top: 12px;
  }
  .downtime-wrapper {
    width: 86%;
    margin: auto;
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
        {#each netbanks as { name, code } (code)}
          <GridItem
            name={getShortBankName(code, $locale)}
            {code}
            fullName={filteredBanks[code]}
            bind:group={$selectedBank} />
        {/each}
      </div>

      <div class="elem-wrap pad">
        <div id="nb-elem" class="elem select" class:invalid>
          <i class="select-arrow"></i>
          <!-- LABEL: Please select a bank -->
          <div class="help">{$t(NETBANKING_SELECT_HELP)}</div>
          <button
            aria-label={`${$selectedBank ? `${selectedBankName} - ${$t(NETBANKING_SELECT_LABEL)}` : $t(NETBANKING_SELECT_LABEL)}`}
            class="input dropdown-like dropdown-bank"
            type="button"
            id="bank-select"
            bind:this={bankSelect}
            on:click={showSearch}
            on:keypress={handleEnterOnButton}>
            {#if $selectedBank}
              <div>{selectedBankName}</div>
              {#if selectedBankHasDowntime}
                <div>
                  <DowntimeIcon severe={selectedBankDowntimeSeverity} />
                </div>
              {/if}
            {:else}
              <!-- LABEL: Select a different bank -->
              {$t(NETBANKING_SELECT_LABEL)}
            {/if}
          </button>
        </div>
      </div>

      {#if showCorporateRadio}
        <div
          class="pad ref-radiocontainer"
          bind:this={radioContainer}
          transition:fade={getAnimationOptions({ duration: 100 })}>
          <!-- LABEL: Complete Payment Using -->
          <label>{$t(SELECTION_RADIO_TEXT)}</label>
          <div class="input-radio">
            <input
              type="radio"
              id="nb_type_retail"
              value="retail"
              checked={!corporateSelected}
              on:click={setRetailOption} />
            <label for="nb_type_retail">
              <div class="radio-display" />
              <!-- LABEL: Retail -->
              <div class="label-content">{$t(RETAIL_RADIO_LABEL)}</div>
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
              <!-- LABEL: Corporate -->
              <div class="label-content">{$t(CORPORATE_RADIO_LABEL)}</div>
            </label>
          </div>
        </div>
      {/if}
      <!-- Show downtime message if the selected bank is down -->
      {#if selectedBankHasDowntime}
        <div class="downtime-wrapper">
          <DowntimeCallout
            showIcon={false}
            severe={selectedBankDowntimeSeverity}>
            <FormattedText
              text={formatTemplateWithLocale(downtimeText, { bank: getLongBankName($selectedBank, $locale) }, $locale)} />
          </DowntimeCallout>
        </div>
      {/if}
    </div>

    <!-- LABEL: Select bank to pay -->
    <!-- LABEL: Search for bank -->
    <!-- LABEL: All banks -->
    <SearchModal
      identifier="netbanking_bank_select"
      title={$t(SEARCH_TITLE)}
      placeholder={$t(SEARCH_PLACEHOLDER)}
      all={$t(SEARCH_ALL)}
      items={translatedBanksArr}
      bind:open={searchModalOpen}
      keys={['code', 'name', 'original']}
      component={BankSearchItem}
      on:close={hideSearch}
      on:select={({ detail }) => {
        $selectedBank = detail.code;
        hideSearch();
      }} />

    <Bottom>
      <!-- Show recurring message for recurring payments -->
      {#if recurring}
        <Callout>{$t(RECURRING_CALLOUT)}</Callout>
      {/if}
    </Bottom>
    {#if !recurring}
      <CTA on:click={() => getSession().preSubmit()} />
    {/if}
  </Screen>
</Tab>
