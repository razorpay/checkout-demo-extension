<script>
  // Utils imports
  import { getThemeMeta } from 'checkoutstore/theme';
  import Analytics from 'analytics';
  import { validateForm } from 'checkoutframe/form';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import PayoutInstrument from 'ui/elements/PayoutInstrument.svelte';
  import PayoutAddAccount from 'ui/tabs/payout/payout-account.svelte';
  import UPITab from 'ui/tabs/upi/index.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import CTA from 'ui/elements/CTA.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    ADD_BANK_ACTION,
    ADD_BANK_BUTTON_DESCRIPTION,
    ADD_BANK_BUTTON_TITLE,
    ADD_UPI_ACTION,
    ADD_UPI_BUTTON_DESCRIPTION,
    ADD_UPI_BUTTON_TITLE,
    SELECT_ACCOUNT_DESCRIPTION,
    SELECT_ACCOUNT_TITLE,
    SELECT_BANK_TITLE,
    SELECT_UPI_TITLE,
  } from 'ui/labels/payouts';

  export let upiAccounts;
  export let bankAccounts;
  export let amount;
  export let topbar;
  export let onSubmit;

  const themeMeta = getThemeMeta();

  let selectedInstrument = null;
  let childTab = null;
  let accountTab;
  topbar.$on('back', () => (childTab = null));

  $: {
    if (childTab) {
      topbar.setTab(childTab);
      topbar.show();
    } else {
      topbar.hide();
    }
  }

  Analytics.setMeta('payout', true);
  Analytics.setMeta('count.accounts.upi', upiAccounts.length);
  Analytics.setMeta('count.accounts.bank', bankAccounts.length);

  export function select(instrument) {
    selectedInstrument = instrument;
    Analytics.track('payout:account:select', instrument);
  }

  export function getSelectedInstrument() {
    return selectedInstrument;
  }

  function submitHandler() {
    if (validateForm()) {
      if (childTab === 'payout_account') {
        onSubmit(accountTab.getPayload());
      } else if (childTab === 'payout_upi') {
        onSubmit({
          account_type: 'vpa',
          vpa: {
            address: _Doc.querySelector('#vpa-upi').value,
          },
        });
      } else {
        onSubmit(selectedInstrument);
      }
    }
  }
</script>

{#if childTab === 'payout_account'}
  <PayoutAddAccount bind:this={accountTab} />
{:else if childTab === 'payout_upi'}
  <UPITab />
{:else}
  <Tab
    method="payouts"
    overrideMethodCheck={true}
    pad={false}
    shown={!childTab}
  >
    <div class="title">
      <!-- LABEL: Select an account -->
      <h3>{$t(SELECT_ACCOUNT_TITLE)}</h3>
      <!-- LABEL: {amount} will be credited to your specified account. -->
      <p>
        {formatTemplateWithLocale(
          SELECT_ACCOUNT_DESCRIPTION,
          { amount },
          $locale
        )}
      </p>
    </div>

    {#if upiAccounts.length}
      <div class="instrument-group">
        <div class="instrument-header">
          <div class="icon-left">
            <Icon icon={themeMeta.icons['upi']} alt="" />
          </div>
          <!-- LABEL: Select a UPI ID -->
          <span class="header-text">{$t(SELECT_UPI_TITLE)}</span>
        </div>
        <div class="options">
          {#each upiAccounts as account (account.id)}
            <PayoutInstrument
              {account}
              selected={selectedInstrument &&
                selectedInstrument.id === account.id}
              on:select={() => select(account)}
            >
              <div class="instrument-name">{account.vpa.address}</div>
            </PayoutInstrument>
          {/each}
          <div
            class="instrument-add option next-option secondary-color"
            on:click={() => (childTab = 'payout_upi')}
          >
            <div class="icon icon-left icon-add">+</div>
            <!-- LABEL: Add UPI ID -->
            {$t(ADD_UPI_ACTION)}
          </div>
        </div>
      </div>
    {/if}

    {#if bankAccounts.length}
      <div class="instrument-group">
        <div class="instrument-header">
          <div class="icon-left ref-nbicon">
            <Icon icon={themeMeta.icons['netbanking']} alt="" />
          </div>
          <!-- LABEL: Select a Bank Account -->
          <span class="header-text">{$t(SELECT_BANK_TITLE)}</span>
        </div>
        <div class="options">
          {#each bankAccounts as account (account.id)}
            <PayoutInstrument
              {account}
              selected={selectedInstrument &&
                selectedInstrument.id === account.id}
              on:select={() => select(account)}
            >
              <div class="instrument-name">
                A/c No. {account.bank_account.account_number}
              </div>
              <div class="instrument-info">
                IFSC: {account.bank_account.ifsc}, {account.bank_account.name}
              </div>
            </PayoutInstrument>
          {/each}
          <div
            class="instrument-add option next-option secondary-color"
            on:click={() => (childTab = 'payout_account')}
          >
            <div class="icon icon-left icon-add">+</div>
            <!-- LABEL: Add Bank Account -->
            {$t(ADD_BANK_ACTION)}
          </div>
        </div>
      </div>
    {/if}

    {#if !upiAccounts.length}
      <div class="options add-option">
        <NextOption
          icon={themeMeta.icons.upi}
          tabindex="0"
          attributes={{ role: 'button', 'aria-label': 'Add a UPI ID' }}
          classes={['secondary-color']}
          on:select={() => (childTab = 'payout_upi')}
        >
          <!-- LABEL: UPI -->
          <div>{$t(ADD_UPI_BUTTON_TITLE)}</div>
          <!-- LABEL: Add a UPI ID (BHIM, PhonePe and more) -->
          <div class="desc">{$t(ADD_UPI_BUTTON_DESCRIPTION)}</div>
        </NextOption>
      </div>
    {/if}

    {#if !bankAccounts.length}
      <div class="options add-option">
        <NextOption
          icon={themeMeta.icons.netbanking}
          tabindex="0"
          attributes={{ role: 'button', 'aria-label': 'Add a UPI ID' }}
          classes={['secondary-color']}
          on:select={() => (childTab = 'payout_account')}
        >
          <!-- LABEL: BANK -->
          <div>BANK</div>
          <!-- LABEL: Add a Bank Account -->
          <div class="desc">{$t(ADD_BANK_BUTTON_DESCRIPTION)}</div>
        </NextOption>
      </div>
    {/if}
  </Tab>
{/if}
<CTA show={selectedInstrument || childTab} on:click={submitHandler}>
  Confirm Account
</CTA>

<style>
  .instrument-group {
    font-size: 13px;
  }

  .instrument-group {
    box-shadow: 0 2px 4px rgba(61, 64, 72, 0.06);
    margin: 12px;
  }

  .instrument-header,
  .instrument-add {
    padding: 14px 60px 16px 40px;
    position: relative;
  }

  .instrument-header {
    border: 1px solid #e6e7e8;
    border-bottom: none;
    position: relative;
  }

  .instrument-add {
    border: 1px solid #e6e7e8;
    padding: 12px 60px 14px 40px !important;
  }

  .icon-left {
    position: absolute;
    left: 12px;
    top: 12px;
    width: 18px;
    height: auto;
  }

  .ref-nbicon {
    left: 14px;
    transform: scale(1.1);
    top: 14px;
  }

  .icon.icon-add {
    font-size: 20px;
    left: 18px;
    top: 10px;
  }

  .instrument-header .header-text {
    text-transform: uppercase;
    color: #072654;
  }

  .instrument-add {
    cursor: pointer;
    color: #072654;
  }

  .instrument-info {
    color: #999;
    font-size: 12px;
  }

  .instrument-add:after {
    content: '\e604';
    font-size: 10px;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    margin-top: 0.2em;
  }

  .icon svg {
    height: 20px;
    max-width: 20px;
  }

  .title {
    padding: 14px 14px 0 14px;
  }

  h3 {
    margin: 0;
    font-weight: bold;
    color: #000;
    font-size: 14px;
    line-height: 15px;
    text-transform: unset;
  }

  p {
    font-size: 12px;
    margin-top: 8px;
    font-weight: 100;
    color: #999;
  }

  .options {
    margin: 0;
    max-height: unset;
  }

  .add-option {
    margin: 16px;
    box-shadow: 0 2px 4px rgba(61, 64, 72, 0.06);
  }

  .desc {
    font-size: 12px;
    color: #999;
  }
  .instrument-group :global(.option-title) {
    margin-left: 24px;
  }
</style>
