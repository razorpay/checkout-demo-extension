<script>
  // Svelte imports
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { onMount } from 'svelte';

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
  import CTAOneCC from 'one_click_checkout/cta/index.svelte';
  import { truncateString } from 'utils/strings';

  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  const { solid_down_arrow } = getIcons();

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
    RECURRING_CALLOUT,
  } from 'ui/labels/netbanking';

  import { t, locale } from 'svelte-i18n';

  import { getShortBankName, getLongBankName } from 'i18n';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { iPhone } from 'common/useragent';
  import { getPreferredBanks } from 'common/bank';
  import { isRecurring } from 'razorpay';
  import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
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

  // Analytics imports
  import NETBANKING_EVENTS from 'ui/tabs/netbanking/events';
  import { PAY_NOW_CTA_LABEL } from 'one_click_checkout/cta/i18n';

  // Props
  export let banks;
  export let downtimes = getDowntimes();
  export let method;
  export let bankOptions;

  // Other Imports
  import { isOneClickCheckout } from 'razorpay';

  // Computed
  let filteredBanks = banks; // Always use this to get the banks
  let showCorporateRadio;
  let maxGridCount;
  let corporateSelected;
  let banksArr;
  let invalid;
  let netbanks;
  let downtimeSeverity = false;
  let selectedBankName;
  let translatedBanksArr;

  let renderCtaOneCC = false;

  $: {
    if ($selectedBank) {
      selectedBankName = banksArr.find(
        (bank) => bank.code === $selectedBank
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

  const isOneClickCheckoutEnabled = isOneClickCheckout();

  export function getPayload() {
    return {
      bank: $selectedBank,
      downtimeSeverity,
      downtimeInstrument: $selectedBank,
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
    Analytics.track(NETBANKING_EVENTS.DROPDOWN_CLICK);
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

    instrument.banks.forEach((code) => {
      if (banks[code]) {
        filteredBanks[code] = banks[code];
      }
    });

    return filteredBanks;
  }

  function filterHiddenBanksUsingConfig(banks, hiddenBanks) {
    banks = _Obj.clone(banks);
    hiddenBanks.forEach((hiddenBank) => {
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
  $: banksArr = _Obj.entries(filteredBanks).map((entry) => ({
    code: entry[0],
    name: entry[1],
    downtime: downtimes[entry[0]],
  }));
  $: translatedBanksArr = banksArr.map((bank) => ({
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
      const netBankingDowntimes = downtimes.netbanking;
      const currentDowntime = checkDowntime(
        netBankingDowntimes,
        'bank',
        $selectedBank
      );
      if (currentDowntime) {
        downtimeSeverity = currentDowntime;
      } else {
        downtimeSeverity = false;
      }
    } else {
      downtimeSeverity = false;
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

  onMount(() => {
    Analytics.track(NETBANKING_EVENTS.SCREEN_LOAD);
    renderCtaOneCC = true;
  });

  onDestroy(() => {
    renderCtaOneCC = false;
  });

  export function onShown() {
    renderCtaOneCC = true;
  }

  export function onHide() {
    renderCtaOneCC = false;
  }
</script>

<!-- TODO: remove override after fixing method check -->
<Tab
  method="netbanking"
  pad={false}
  overrideMethodCheck
  hasMessage={!!downtimeSeverity}
>
  <Screen pad={false}>
    <div>
      <div
        id="netb-banks"
        class="clear grid count-3"
        class:netb-banks-one-cc={isOneClickCheckoutEnabled}
      >
        {#each netbanks as { name, code } (code)}
          <GridItem
            name={getShortBankName(code, $locale)}
            {code}
            fullName={filteredBanks[code]}
            bind:group={$selectedBank}
          />
        {/each}
      </div>

      <div class="elem-wrap pad">
        <div
          id="nb-elem"
          class="elem select"
          class:invalid
          class:nb-one-cc-wrapper={isOneClickCheckoutEnabled}
        >
          {#if !isOneClickCheckoutEnabled}
            <i class="select-arrow"></i>
          {/if}

          <!-- LABEL: Please select a bank -->
          <div class="help">
            {$t(NETBANKING_SELECT_HELP)}
          </div>
          {#if $selectedBank && isOneClickCheckoutEnabled}
            <span class="nb-select-bank-text"
              >{$t(NETBANKING_SELECT_LABEL)}</span
            >
          {/if}

          {#if isOneClickCheckoutEnabled}
            <span class="drop-down-icon-wrapper">
              <Icon icon={solid_down_arrow} />
            </span>
          {/if}

          <button
            aria-label={`${
              $selectedBank
                ? `${selectedBankName} - ${$t(NETBANKING_SELECT_LABEL)}`
                : $t(NETBANKING_SELECT_LABEL)
            }`}
            class="input dropdown-like dropdown-bank"
            class:nb-one-cc-button={isOneClickCheckoutEnabled}
            type="button"
            id="bank-select"
            bind:this={bankSelect}
            on:click={showSearch}
            on:keypress={handleEnterOnButton}
          >
            {#if $selectedBank}
              <div>
                {truncateString(selectedBankName, 28)}
              </div>
              {#if !!downtimeSeverity}
                <div>
                  <DowntimeIcon severe={downtimeSeverity} />
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
          transition:fade={getAnimationOptions({ duration: 100 })}
        >
          <!-- LABEL: Complete Payment Using -->
          <label>{$t(SELECTION_RADIO_TEXT)}</label>
          <div class="input-radio">
            <input
              type="radio"
              id="nb_type_retail"
              value="retail"
              checked={!corporateSelected}
              on:click={setRetailOption}
            />
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
              on:click={setCorporateOption}
            />
            <label for="nb_type_corporate">
              <div class="radio-display" />
              <!-- LABEL: Corporate -->
              <div class="label-content">{$t(CORPORATE_RADIO_LABEL)}</div>
            </label>
          </div>
        </div>
      {/if}
      <!-- Show downtime message if the selected bank is down -->
      {#if !!downtimeSeverity}
        <div class="downtime-wrapper">
          <DowntimeCallout
            showIcon={false}
            severe={downtimeSeverity}
            downtimeInstrument={$selectedBank}
          />
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
      }}
    />

    <Bottom>
      <!-- Show recurring message for recurring payments -->
      {#if recurring}
        <Callout>{$t(RECURRING_CALLOUT)}</Callout>
      {/if}
    </Bottom>
    {#if !recurring}
      <CTA on:click={() => getSession().preSubmit()} />
    {/if}
    {#if renderCtaOneCC}
      <CTAOneCC
        disabled={!$selectedBank}
        on:click={() => getSession().preSubmit()}
      >
        {$t(PAY_NOW_CTA_LABEL)}
      </CTAOneCC>
    {/if}
  </Screen>
</Tab>

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

  .nb-one-cc-wrapper {
    border: 1px solid rgba(38, 50, 56, 0.3);
    margin-top: 20px;
    border-radius: 4px;
    padding: 0px 12px;
    height: 48px;
    padding: 12px 16px;
    box-sizing: border-box;
  }

  .nb-one-cc-button {
    padding-top: 0px;
    padding-bottom: 0px;
    height: 100%;
    display: flex;
    margin-top: 2px !important;
  }

  .nb-one-cc-arrow {
    position: absolute;
    font-size: 20px;
    bottom: 20px;
    right: 10px;
    color: #8f8f8f;
  }

  .nb-one-cc-wrapper::after {
    border-bottom: none !important;
  }

  .nb-select-bank-text {
    position: absolute;
    top: -10px;
    background: white;
    padding: 0px 2px;
  }

  .netb-banks-one-cc {
    margin-top: 24px;
    border-top: 1px solid #ebedf0;
  }

  .drop-down-icon-wrapper {
    position: absolute;
    right: 14px;
    top: 14px;
  }
</style>
