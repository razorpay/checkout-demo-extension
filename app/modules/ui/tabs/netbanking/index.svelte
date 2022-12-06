<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
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
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import BankSearchItem from 'ui/elements/search-item/Bank.svelte';
  import CTAOld from 'ui/elements/CTA.svelte';
  import BankDropdownSelect from 'ui/components/BankDropdownSelect.svelte';

  import { getIcons } from 'one_click_checkout/sessionInterface';
  import * as _ from 'utils/_';

  // i18n
  import {
    NETBANKING_SELECT_LABEL,
    NETBANKING_SELECT_HELP,
    CORPORATE_RADIO_LABEL,
    RETAIL_RADIO_LABEL,
    SELECTION_RADIO_TEXT,
    SEARCH_PLACEHOLDER,
    SEARCH_ALL,
    SELECT_BANK,
  } from 'ui/labels/netbanking';
  import { AUTHENTICATE } from 'cta/i18n';

  import { t, locale } from 'svelte-i18n';

  import { getShortBankName, formatMessageWithLocale } from 'i18n';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import Analytics, { Events } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { iPhone } from 'common/useragent';
  import {
    computeBankData,
    computeTranslatedBanks,
    getPreferredBanks,
    handleEnterOnBanking,
  } from 'common/bank';
  import { isRecurring, isCAW } from 'razorpay';
  import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
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
  import { NetbankingTracker } from 'netbanking/analytics/events';

  // Props
  export let banks;
  export let downtimes = getDowntimes();
  export let method;
  export let bankOptions;

  const { solid_down_arrow } = getIcons();

  // Other Imports
  import { isRedesignV15 } from 'razorpay';
  import triggerSearchModal from 'components/SearchModal';
  import CTA from 'cta';
  import { getInstrumentsWithOrder } from 'common/helper';
  import { MiscTracker } from 'misc/analytics/events';
  import { AnalyticsV2State } from 'analytics-v2';

  // Computed
  let filteredBanks = banks; // Always use this to get the banks
  let showCorporateRadio;
  let maxGridCount;
  let corporateSelected;
  let invalid;
  let netbanks;
  let downtimeSeverity = false;
  let translatedBanksArr;

  // Refs
  let radioContainer;
  let bankSelect;

  const recurring = isRecurring();
  const dispatch = createEventDispatcher();

  const isRedesignV15Enabled = isRedesignV15();

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
    triggerSearchModal({
      identifier: 'netbanking_bank_select',
      placeholder: SEARCH_PLACEHOLDER,
      all: SEARCH_ALL,
      items: translatedBanksArr,
      keys: ['code', 'name', 'original'],
      component: BankSearchItem,
      onClose: onSearchHide,
      onSelect: (data) => {
        $selectedBank = data.code;
        onSearchHide();
      },
    });
    Analytics.track(NETBANKING_EVENTS.DROPDOWN_CLICK);
  }

  function onSearchHide() {
    // Restore focus
    if (bankSelect) {
      bankSelect.focus();
    }
  }

  function setRetailOption() {
    const retailOption = getRetailOption($selectedBank, filteredBanks);
    if (retailOption) {
      $selectedBank = retailOption;
    }
  }

  $: {
    const { bankList } = computeBankData({
      banks,
      instrument: $methodInstrument,
      hiddenBanks: $hiddenBanksUsingConfig,
      method,
    });
    filteredBanks = bankList;

    // If the currently selected bank is not present in filtered banks, we need to unset it.
    if (!filteredBanks[$selectedBank]) {
      $selectedBank = '';
    }

    /**
     * If the method is netbanking and if there's only
     * one bank available, select it automatically to reduce a user click.
     * Of course, do this only when there's nothing preselected.
     */
    const banksList = Object.keys(filteredBanks);
    if (method === 'netbanking' && !$selectedBank && banksList.length === 1) {
      $selectedBank = banksList[0];
    }
  }

  $: showCorporateRadio =
    !recurring && hasMultipleOptions($selectedBank, filteredBanks);
  $: corporateSelected = isCorporateCode($selectedBank);
  $: maxGridCount = recurring ? 3 : 6;
  $: {
    translatedBanksArr = computeTranslatedBanks(filteredBanks);
  }
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
      NetbankingTracker.BANK_OPTION_SELECTED({
        name: bankCode,
      });
      try {
        MiscTracker.INSTRUMENT_SELECTED({
          block: AnalyticsV2State.selectedBlock,
          method: {
            name: 'netbanking',
          },
          instrument: {
            name: bankCode,
            saved: false,
            personalisation: false,
          },
        });
      } catch {}
      Analytics.track('bank:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          bank: bankCode,
        },
      });

      Events.TrackBehav(NETBANKING_EVENTS.BANK_SELECTED, {
        bank_selected: bankCode,
      });

      dispatch('bankSelected', {
        bank: {
          code: bankCode,
        },
      });
    }
  }

  onMount(() => {
    try {
      MiscTracker.INSTRUMENTATION_SELECTION_SCREEN({
        block: AnalyticsV2State.selectedBlock,
        method: {
          name: 'netbanking',
        },
        instruments: getInstrumentsWithOrder(netbanks, 'netbanking'),
      });
      NetbankingTracker.BANK_OPTIONS_SHOWN({
        instruments: getInstrumentsWithOrder(netbanks, 'netbanking'),
      });
    } catch {}
    Analytics.track(NETBANKING_EVENTS.SCREEN_LOAD);
    Analytics.track(NETBANKING_EVENTS.SCREEN_LOAD_V2);
  });

  export function onShown() {
    Analytics.track(NETBANKING_EVENTS.SCREEN_LOAD);
    Events.TrackRender(NETBANKING_EVENTS.SCREEN_LOAD_V2);
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
    <div class:screen-one-cc={isRedesignV15Enabled}>
      {#if isRedesignV15Enabled}
        <h3 class="header-title">{$t(SELECT_BANK)}</h3>
      {/if}
      <div
        id="netb-banks"
        class="clear grid count-3"
        class:netb-banks-one-cc={isRedesignV15Enabled}
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

      <div class="pad">
        <BankDropdownSelect
          selectLabel={formatMessageWithLocale(
            NETBANKING_SELECT_LABEL,
            $locale
          )}
          selectHelpLabel={formatMessageWithLocale(
            NETBANKING_SELECT_HELP,
            $locale
          )}
          selectedBank={$selectedBank}
          bankList={translatedBanksArr}
          {downtimeSeverity}
          {invalid}
          on:click={showSearch}
          on:keypress={({ detail }) => {
            handleEnterOnBanking(detail);
          }}
          bind:this={bankSelect}
        />
      </div>
      {#if showCorporateRadio}
        <div
          class="pad ref-radiocontainer"
          bind:this={radioContainer}
          transition:fade={getAnimationOptions({ duration: 100 })}
        >
          <!-- LABEL: Complete Payment Using -->
          <label class="select-bank-type">{$t(SELECTION_RADIO_TEXT)}</label>
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

    {#if !recurring && !isRedesignV15Enabled}
      <CTAOld on:click={() => getSession().preSubmit()} />
    {/if}
    <CTA
      screen="netbanking"
      tab="netbanking"
      disabled={!$selectedBank}
      showAmount={!isCAW()}
      label={isCAW() ? $t(AUTHENTICATE) : ''}
    />
  </Screen>
</Tab>

<style lang="scss">
  #netb-banks {
    overflow: hidden;
  }

  .ref-radiocontainer {
    margin-top: -6px;
    margin-bottom: 18px;
  }

  .select-bank-type {
    font-weight: 600;
    margin-bottom: 10px;
  }

  .input-radio:first-of-type {
    margin-top: 4px;
  }

  .downtime-wrapper {
    width: 86%;
    margin: auto;
  }

  .screen-one-cc {
    min-height: 100%;
  }

  .netb-banks-one-cc {
    border-top: 1px solid var(--light-dark-color);
  }

  .header-title {
    margin: 20px 18px 14px;
    text-transform: capitalize;
    color: var(--primary-text-color);
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
  }

  :global(.redesign) {
    .ref-radiocontainer {
      label {
        display: flex;
        align-items: center;
      }

      .radio-display {
        position: static;

        &:after {
          top: 6px;
        }
      }

      .label-content {
        padding: 4px 0px 4px 14px;
      }
    }
  }
</style>
