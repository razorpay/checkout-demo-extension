<script lang="ts">
  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getLongBankName } from 'i18n';

  import {
    BANK_DETAILS_HEADING,
    ACCOUNT_NUMER_LABEL,
    CUSTOMER_NAME_LABEL,
    IFSC_LABEL,
  } from 'ui/labels/home';

  import type { TPVBank } from 'tpv/types/tpv';

  export let bank: TPVBank;
  export let accountName: string;
  export let showIfsc: boolean;
</script>

<div class="customer-bank-details">
  {#if bank.method}
    <p class="method" class:text-uppercase={bank.method === 'upi'}>
      {bank.method}
    </p>
  {/if}
  <div class="bank-account-wrapper">
    <div class="bank-details">
      {#if bank.image}
        <img
          src={bank.image}
          alt={getLongBankName(bank.code, $locale, bank.name)}
        />
      {:else}
        <!-- LABEL: Bank Details -->
        {#if bank.name}
          {getLongBankName(bank.code, $locale, bank.name)}
        {:else}{$t(BANK_DETAILS_HEADING)}{/if}
      {/if}
    </div>

    <div class="account-details">
      {#if bank.account_number}
        <div class="wrapper">
          <!-- LABEL: Account Number -->
          <div class="item">{$t(ACCOUNT_NUMER_LABEL)}</div>
          <div class="item">{bank.account_number}</div>
        </div>
      {/if}
      {#if accountName}
        <div class="wrapper">
          <!--  Customer Name -->
          <div class="item">{$t(CUSTOMER_NAME_LABEL)}</div>
          <div class="item">{accountName}</div>
        </div>
      {/if}
      {#if showIfsc && bank.ifsc}
        <div class="wrapper">
          <!-- LABEL: IFSC code -->
          <div class="item">{$t(IFSC_LABEL)}</div>
          <div class="text-uppercase item">{bank.ifsc}</div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .customer-bank-details {
    align-items: center;
    background: linear-gradient(
      89.97deg,
      rgba(213, 232, 254, 0.7) -1.19%,
      rgba(237, 245, 255, 0.7) 99.97%
    );
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    .method {
      font-weight: 700;
      text-transform: capitalize;
      margin: 0;
      margin-right: 5px;
    }
    .text-uppercase {
      text-transform: uppercase;
    }
    .bank-account-wrapper {
      display: flex;
      align-items: center;
      .bank-details {
        display: flex;
        img {
          height: 16px;
          width: 16px;
        }
      }
      .account-details {
        margin-top: 0;
        display: flex;
        flex-direction: column;
        .wrapper {
          display: flex;
          align-items: center;
          .item {
            margin: 0;
            &:first-child {
              margin: 0px 8px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
</style>
