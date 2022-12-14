<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';

  // Store
  import { selectedFPXBank, hiddenFPXBanksUsingConfig } from 'fpx/store';
  import { methodInstrument } from 'checkoutstore/screens/home';

  // UI imports
  import Screen from 'ui/layouts/Screen.svelte';
  import BankSearchItem from 'ui/elements/search-item/Bank.svelte';
  import triggerSearchModal from 'components/SearchModal';
  import CTA from 'cta';
  import BankRadioOptions from 'fpx/ui/components/BankRadioOptions.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import BankDropdownSelect from 'ui/components/BankDropdownSelect.svelte';
  import CTAOld from 'ui/elements/CTA.svelte';

  // i18n
  import {
    FPX_SELECT_LABEL,
    FPX_SELECT_HELP,
    FPX_SEARCH_PLACEHOLDER,
    FPX_SEARCH_ALL,
    FPX_SELECT_BANK,
    FPX_TERMS_AND_CONDITIONS,
  } from '../i18n/label';
  import { t, locale } from 'svelte-i18n';
  import { formatMessageWithLocale, formatTemplateWithLocale } from 'i18n';

  // utils
  import Analytics, { Events } from 'analytics';
  import {
    BANK_TYPES,
    computeBankData,
    handleEnterOnBanking,
    isCorporateCode,
  } from 'common/bank';
  import * as _ from 'utils/_';
  import { allBanksOffline, checkOffline, handleFpxPayment } from 'fpx/helper';
  import { FPX_TERMS_AND_COND_URL } from 'fpx/constants';
  import type { TranslatedBankType } from 'common/types/bank';
  import { getIcons } from 'checkoutstore/theme';
  import { getMerchantMethods, isRedesignV15 } from 'razorpay';
  import type { Banks } from 'razorpay/types/Preferences';

  // Analytics
  import FPX_EVENTS from 'fpx/analytics/events';
  import { computeTranslatedBanks } from 'helper/bank';

  /* --- props --- */
  export let banks: Banks = getMerchantMethods().fpx;
  /* --- props end --- */

  const { fpx, curlec_logo } = getIcons();

  // active bank list filtered by type, enabled, config
  let filteredBanks: Partial<Banks> = banks;

  // translated array of banks for search dropdown menu
  let translatedBanksArr: TranslatedBankType[];

  // ref of dropdown svelte component
  let bankDropdownSelect: BankDropdownSelect;

  let activeType = isCorporateCode($selectedFPXBank)
    ? BANK_TYPES.CORPORATE
    : BANK_TYPES.RETAIL;

  // whether to disable retail radio button or not
  let retailDisabled = false;

  // whether to disable corporate radio button or not
  let corporateDisabled = false;

  /**
   * open search modal
   */
  function showSearch() {
    triggerSearchModal({
      identifier: 'fpx_bank_select',
      placeholder: FPX_SEARCH_PLACEHOLDER,
      all: FPX_SEARCH_ALL,
      items: translatedBanksArr,
      keys: ['code', 'name', 'original'],
      component: BankSearchItem,
      onClose: onSearchHide,
      onSelect: (data: TranslatedBankType) => {
        $selectedFPXBank = data.code;
        Events.TrackBehav(FPX_EVENTS.BANK_SELECTED, {
          bank_selected: data.code,
        });
        onSearchHide();
      },
    });
    Analytics.track(FPX_EVENTS.DROPDOWN_CLICK);
  }

  /**
   * focus dropdown select after hiding search modal
   */
  function onSearchHide() {
    bankDropdownSelect?.focus();
  }

  /**
   * radio button (retail/corporate) click listener
   */
  function handleRadioSelect({ detail }: { detail: { type: string } }) {
    if (detail?.type) {
      $selectedFPXBank = '';
      activeType = detail.type;
    }
  }

  // compute filteredBanks
  $: {
    const { bankList, retailBanks, corporateBanks } = computeBankData({
      banks,
      instrument: $methodInstrument,
      hiddenBanks: $hiddenFPXBanksUsingConfig as string[],
      method: 'fpx',
    });
    filteredBanks = bankList;

    // If the currently selected bank is not present in filtered banks, we need to unset it.
    if (!filteredBanks[$selectedFPXBank]) {
      $selectedFPXBank = '';
    }

    // disable radio button if all retail/corporate banks are offline
    retailDisabled = allBanksOffline(retailBanks);
    corporateDisabled = allBanksOffline(corporateBanks);

    filteredBanks =
      activeType === BANK_TYPES.RETAIL ? retailBanks : corporateBanks;

    /**
     * if there's only one bank available,
     * select it automatically to reduce a user click.
     * Of course, do this only when there's nothing preselected.
     */
    const banksList = Object.keys(filteredBanks);
    if (
      !$selectedFPXBank &&
      banksList.length === 1 &&
      !checkOffline(banksList[0])
    ) {
      $selectedFPXBank = banksList[0];
    }
  }

  // compute translatedBanksArr
  $: {
    translatedBanksArr = computeTranslatedBanks(filteredBanks, true);
  }

  onMount(() => {
    Analytics.track(FPX_EVENTS.SCREEN_LOAD);
  });
</script>

<Screen pad={false} removeAccountTab>
  <div class="screen">
    <BankRadioOptions
      {activeType}
      on:click={handleRadioSelect}
      {retailDisabled}
      {corporateDisabled}
    />

    <div class="dropdown-section">
      <p class="dropdown-title">{$t(FPX_SELECT_BANK)}</p>
      <BankDropdownSelect
        selectLabel={formatMessageWithLocale(FPX_SELECT_LABEL, $locale)}
        selectHelpLabel={formatMessageWithLocale(FPX_SELECT_HELP, $locale)}
        selectedBank={$selectedFPXBank}
        bankList={translatedBanksArr}
        invalid={!$selectedFPXBank}
        on:click={showSearch}
        on:keypress={({ detail }) => {
          handleEnterOnBanking(detail);
        }}
        bind:this={bankDropdownSelect}
      />
    </div>
  </div>
  <AccountTab logos={[curlec_logo, fpx]} />
  <div class="fpx-terms">
    <p class="fpx-terms-text">
      {@html formatTemplateWithLocale(
        FPX_TERMS_AND_CONDITIONS,
        { url: FPX_TERMS_AND_COND_URL },
        $locale
      )}
    </p>
  </div>
</Screen>
<CTA
  screen="fpx"
  tab="fpx"
  disabled={!$selectedFPXBank}
  onSubmit={() => handleFpxPayment($selectedFPXBank)}
/>
{#if !isRedesignV15()}
  <CTAOld on:click={() => handleFpxPayment($selectedFPXBank)} />
{/if}

<style lang="scss">
  * {
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }
  .screen {
    padding: 30px 16px 0px;
    min-height: 100%;
  }

  .dropdown-section {
    margin-top: 50px;
  }
  .dropdown-title {
    text-transform: capitalize;
    color: var(--primary-text-color);
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
  }

  .fpx-terms {
    padding: 12px 0px;
    margin: 0px 16px;
    border-top: 1px solid #ebebeb;
  }

  .fpx-terms-text {
    font-size: 10px;
  }

  .dropdown-section {
    :global(.select) {
      margin-top: 12px;
    }
  }
</style>
