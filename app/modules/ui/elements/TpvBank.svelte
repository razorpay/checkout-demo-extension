<script>
  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getLongBankName } from 'i18n';

  import {
    BANK_DETAILS_HEADING,
    ACCOUNT_NUMER_LABEL,
    CUSTOMER_NAME_LABEL,
    IFSC_LABEL,
  } from 'ui/labels/home';

  export let bank;
  export let accountName;
  export let showIfsc;
</script>

<div class="customer-bank-details">
  <div class="bank-name">
    {#if bank.image}<img src={bank.image} alt="" />{/if}
    <!-- LABEL: Bank Details -->
    {#if bank.name}
      {getLongBankName(bank.code, $locale, bank.name)}
    {:else}{$t(BANK_DETAILS_HEADING)}{/if}
  </div>
  {#if bank.account_number}
    <div class="account-details clearfix">
      <!-- LABEL: Account Number -->
      <div>{$t(ACCOUNT_NUMER_LABEL)}</div>
      <div>{bank.account_number}</div>
    </div>
  {/if}
  {#if accountName}
    <div class="account-details clearfix">
      <!-- LABEL: Customer Name -->
      <div>{$t(CUSTOMER_NAME_LABEL)}</div>
      <div>{accountName}</div>
    </div>
  {/if}
  {#if showIfsc && bank.ifsc}
    <div class="account-details clearfix">
      <!-- IFSC code -->
      <div>{$t(IFSC_LABEL)}</div>
      <div class="text-uppercase">{bank.ifsc}</div>
    </div>
  {/if}
</div>

<style>
  .customer-bank-details {
    padding: 24px;
  }
</style>
