<script>
  // UI Imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n
  import {
    MULTI_TPV_TITLE,
    MULTI_TPV_NETBANKING_TITLE,
    MULTI_TPV_UPI_SUBTITLE,
    MULTI_TPV_UPI_TITLE,
  } from 'ui/labels/home';

  import { getShortBankName, formatTemplateWithLocale } from 'i18n';

  import { t, locale } from 'svelte-i18n';

  // Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Props
  export let bank;
  export let icons;
  export let selectedOption = '';

  let bankName;
  $: {
    if (bank) {
      bankName = getShortBankName(bank.code, $locale);
    }
  }

  function trackTpvOptionSelected(data) {
    Analytics.track('multi_tpv:select', {
      type: AnalyticsTypes.BEHAV,
      data,
    });
  }

  $: {
    if (selectedOption) {
      trackTpvOptionSelected({ type: selectedOption });
    }
  }

  function handleOptionSelection(option) {
    selectedOption = option;
  }
</script>

<!-- LABEL: Pay Using -->
<h3 class="title">{$t(MULTI_TPV_TITLE)}</h3>
<div class="border-list">
  <SlottedRadioOption
    name="method"
    value="netbanking"
    selected={selectedOption === 'netbanking'}
    on:click={(_) => handleOptionSelection('netbanking')}
  >
    <i slot="icon">
      <Icon icon="https://cdn.razorpay.com/bank/{bank.code}.gif" />
    </i>
    <!-- LABEL: A/C: {accountNumber} -->
    <div slot="title">
      {formatTemplateWithLocale(
        MULTI_TPV_NETBANKING_TITLE,
        { accountNumber: bank.account_number },
        $locale
      )}
    </div>
    <div slot="subtitle">{bankName}</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="method"
    value="upi"
    selected={selectedOption === 'upi'}
    on:click={(_) => handleOptionSelection('upi')}
  >
    <i slot="icon">
      <Icon icon={icons.upi} />
    </i>
    <!-- LABEL: UPI -->
    <div slot="title">{$t(MULTI_TPV_UPI_TITLE)}</div>
    <!-- LABEL: {bankName} Account {accountNumber} -->
    <div slot="subtitle">
      {formatTemplateWithLocale(
        MULTI_TPV_UPI_SUBTITLE,
        { bankName, accountNumber: bank.account_number },
        $locale
      )}
    </div>
  </SlottedRadioOption>
</div>
