<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  // UI imports
  import Tab from 'templates/tabs/Tab.svelte';
  import GridItem from 'templates/tabs/netbanking/GridItem.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import DowntimeCallout from 'templates/views/ui/DowntimeCallout.svelte';
  import Screen from 'templates/layouts/Screen.svelte';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { iPhone } from 'common/useragent';
  import { getPreferredBanks } from 'common/bank';
  import { getSession } from 'sessionmanager';
  import * as InputActions from 'actions/input';
  import {
    hasMultipleOptions,
    getRetailOption,
    getCorporateOption,
    isCorporateCode,
  } from 'common/bank';
  import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';

  // Props
  export let selectedBankCode = '';
  export let banks;
  export let recurring;
  export let downtimes = {};
  export let method;
  export let bankOptions;
  export let corporateOption = '';
  export let retailOption = '';
  export let active = false;

  // Computed
  let showCorporateRadio;
  let maxGridCount;
  let corporateSelected;
  let banksArr;
  let invalid;
  let netbanks;
  let selectedBankHasSevereDowntime;
  let selectedBankHasLowDowntime;
  let selectedBankHasDowntime;

  // Refs
  let radioContainer;

  // Actions
  const focus = InputActions.focus;
  const blur = InputActions.blur;
  const input = InputActions.input;

  const session = getSession();
  const dispatch = createEventDispatcher();

  export function setCorporateOption() {
    const corporateOption = getCorporateOption(selectedBankCode, banks);

    if (corporateOption) {
      selectedBankCode = corporateOption;
    }
  }

  export function onShown() {
    active = true;
  }

  export function onBack() {
    active = false;
  }

  export function setRetailOption() {
    const retailOption = getRetailOption(selectedBankCode, banks);
    if (retailOption) {
      selectedBankCode = retailOption;
    }
  }

  export function getSelectedBank() {
    return selectedBankCode;
  }

  export function setSelectedBank(bankCode) {
    selectedBankCode = bankCode;
  }

  export function deselectBank() {
    selectedBankCode = '';
  }

  $: showCorporateRadio =
    !recurring && hasMultipleOptions(selectedBankCode, banks);
  $: corporateSelected = isCorporateCode(selectedBankCode);
  $: maxGridCount = recurring ? 3 : 6;
  $: banksArr = _Arr.map(_Obj.entries(banks), entry => ({
    code: entry[0],
    name: entry[1],
    downtime: downtimes[entry[0]],
  }));
  $: invalid = method !== 'emandate' && !selectedBankCode;
  $: netbanks = getPreferredBanks(banks, bankOptions).slice(0, maxGridCount);
  $: selectedBankHasSevereDowntime =
    method === 'netbanking' &&
    _Arr.contains(downtimes.high.banks, selectedBankCode);
  $: selectedBankHasLowDowntime =
    method === 'netbanking' &&
    _Arr.contains(downtimes.low.banks, selectedBankCode);
  $: selectedBankHasDowntime =
    selectedBankHasSevereDowntime || selectedBankHasLowDowntime;

  $: {
    const selected = corporateSelected;

    if (showCorporateRadio) {
      setTimeout(() => radioContainer.scrollIntoView(), 300);
    }
  }

  $: {
    const bankCode = selectedBankCode;

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
</style>

<!-- TODO: remove override after fixing method check -->
<Tab
  method="netbanking"
  pad={false}
  overrideMethodCheck
  hasMessage={selectedBankHasDowntime}>
  <Screen pad={false}>
    <div slot="main">
      <div id="netb-banks" class="clear grid count-3">
        {#each netbanks as { name, code }}
          <GridItem
            {name}
            {code}
            fullName={banks[code]}
            bind:group={selectedBankCode} />
        {/each}
      </div>

      <div class="elem-wrap pad">
        <div id="nb-elem" class="elem select" class:invalid>
          <i class="select-arrow"></i>
          <div class="help">Please select a bank</div>
          <select
            id="bank-select"
            name="bank"
            required
            class="input no-refresh no-validate"
            pattern="[\w]+"
            bind:value={selectedBankCode}
            use:focus
            use:blur
            use:input>
            <option value="">Select a different Bank</option>
            {#each banksArr as bank}
              <option value={bank.code}>{bank.name}</option>
            {/each}
          </select>
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

    <div slot="bottom">
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
            <strong>{banks[selectedBankCode]}</strong>
            accounts are temporarily unavailable right now. Please select
            another bank.
          {:else}
            <strong>{banks[selectedBankCode]}</strong>
            accounts are experiencing low success rates.
          {/if}
        </DowntimeCallout>
      {/if}
    </div>

  </Screen>
</Tab>
