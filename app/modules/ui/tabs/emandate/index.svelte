<script>
  /* global _Arr */

  import { getSession } from 'sessionmanager';

  // UI Imports
  import Screen from 'ui/layouts/Screen.svelte';
  import Tab from 'ui/tabs/Tab.svelte';

  import AccountNumberField from 'ui/elements/fields/emandate/AccountNumberField.svelte';
  import IfscField from 'ui/elements/fields/emandate/IfscField.svelte';
  import NameField from 'ui/elements/fields/emandate/NameField.svelte';

  // Store imports
  import {
    accountNumber,
    name,
    ifsc,
    accountType,
    authType,
  } from 'checkoutstore/screens/emandate';

  import { selectedBank } from 'checkoutstore/screens/netbanking';

  import {
    getEMandateAuthTypes,
    getEMandateBanks,
  } from 'checkoutstore/methods';

  // Utils
  import { getBankLogo } from 'common/bank';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';

  const session = getSession();

  // Prefill
  const prefilledBank = session.get('prefill.bank');
  const prefillledBankAccount = session.get(
    'prefill.bank_account[account_number]'
  );
  const prefilledName = session.get('prefill.bank_account[name]');
  const prefilledIfsc = session.get('prefill.bank_account[ifsc]');
  const prefilledAuthType = session.get('prefill.auth_type');

  let prefilledAccountType = session.get('prefill.bank_account[account_type]');

  const AuthTypes = {
    NETBANKING: 'netbanking',
    DEBIT_CARD: 'debitcard',
  };

  const accountTexts = {
    savings: 'Savings Account',
    current: 'Current Account',
  };
  const accountTypes = _Obj.keys(accountTexts);

  if (!_Arr.contains(accountTypes, prefilledAccountType)) {
    prefilledAccountType = false;
  }

  // Set prefill
  $accountNumber = prefillledBankAccount;
  $name = prefilledName;
  $ifsc = prefilledIfsc;
  $accountType = prefilledAccountType;
  $authType = prefilledAuthType;

  function getBankName(bankCode) {
    return (banks[bankCode] || {}).name || '';
  }

  function showLandingView() {
    let view = Views.AUTH_SELECTION;

    if (prefilledBank) {
      $selectedBank = prefilledBank;
    }

    if (prefilledAuthType) {
      $authType = prefilledAuthType;
    }

    if (shouldSkipAuthSelection()) {
      view = Views.BANK_DETAILS;
    }

    setView(view);
  }

  function shouldSkipAuthSelection() {
    return prefilledBank && prefilledAuthType;
  }

  export function onShown() {
    showLandingView();
  }

  export function onBack() {
    if (currentView === Views.AUTH_SELECTION || shouldSkipAuthSelection()) {
      $selectedBank = '';
    }

    if (!prefilledBank && currentView === Views.AUTH_SELECTION) {
      session.switchTab('netbanking');
      return true;
    }

    if (currentView === Views.BANK_DETAILS) {
      // TODO: skip if both auth type and bank were prefilled.
      if (shouldSkipAuthSelection()) {
        return false;
      }

      setView(Views.AUTH_SELECTION);
      return true;
    }

    return false;
  }

  export function getPayload() {
    return {
      'bank_account[account_number]': $accountNumber,
      'bank_account[ifsc]': $ifsc,
      'bank_account[name]': $name,
      'bank_account[account_type]': $accountType,
      auth_type: $authType,
      bank: $selectedBank,
    };
  }

  const Views = {
    AUTH_SELECTION: 'auth_selection',
    BANK_DETAILS: 'bank_details',
  };

  let currentView = Views.AUTH_SELECTION;

  let bankName;
  $: {
    bankName = getBankName($selectedBank);
  }

  let availableAuthTypes;
  $: {
    availableAuthTypes = getEMandateAuthTypes($selectedBank);
  }

  const banks = getEMandateBanks();

  function resetBank() {
    session.switchTab('netbanking');
    // Wait for transition to complete before resetting bank
    setTimeout(() => {
      $selectedBank = '';
    }, 200);
  }

  function setAuthType(newAuthType) {
    $authType = newAuthType;
  }

  function setView(view) {
    currentView = view;
  }

  $: {
    if (currentView !== Views.BANK_DETAILS) {
      hideCta();
    } else {
      showCtaWithDefaultText();
    }
  }

  function handleAuthTypeClicked(newAuthType) {
    setAuthType(newAuthType);
    trackAuthTypeSelected(newAuthType);
    setView(Views.BANK_DETAILS);
  }

  function trackAuthTypeSelected(authType) {
    Analytics.track('emandate:auth_type:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        auth_type: authType,
      },
    });
  }

  const icons = session.themeMeta.icons;
</script>

<style>
  .legend {
    text-align: left;
    padding-left: 12px;
    margin-top: 10px;
  }

  .desc {
    display: block;
    color: #777;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
  }

  #emandate-bank {
    border: 1px solid #e6e7e8;
    padding: 14px;
    position: relative;
    display: flex;
  }

  #emandate-bank .bank-icon {
    top: 23px;
    left: 14px;
    margin: 0;
  }

  #emandate-bank .bank-name {
    font-size: 14px;
  }

  #emandate-bank .btn-change-bank {
    font-size: 12px;
    cursor: pointer;
    margin-top: -14px;
    margin-bottom: -14px;
    line-height: 40px;
    margin-left: auto;
  }

  #emandate-bank .btn-change-bank:after {
    content: '\e601';
    font-size: 22px;
    position: relative;
    left: 4px;
    top: 1px;
  }

  #emandate-options {
    border: 1px solid #eee;
    border-radius: 2px;
    background: #f9fafb;
  }

  .auth-option {
    width: auto;
    float: none;
    position: relative;
    border: 0;
    padding: 14px 0;
    text-align: left;
    cursor: pointer;
  }

  .auth-option:not(:first-child) {
    border-top: 1px solid #eee;
  }

  .auth-option i {
    float: left;
    font-size: 32px;
    margin: 2px 16px;
    line-height: 30px;
    min-width: 27px;
    width: 27px;
    height: 27px;
  }

  #emandate-options .auth-option.disabled {
    color: #80859b;
    background: #efefef;
    cursor: not-allowed;
  }

  #emandate-options .auth-option.disabled .desc {
    display: none;
  }

  #emandate-options .auth-option.disabled:hover label {
    background: #efefef;
  }

  #emandate-options .auth-option.disabled .theme {
    color: #80859b;
  }

  #emandate-inner {
    padding-top: 12px;
  }

  #emandate-inner .bank-icon {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }

  .emandate-fields {
    padding: 0 12px;
  }

  .bank-icon img {
    max-width: 100%;
    max-height: 100%;
  }
</style>

<Tab method="emandate" overrideMethodCheck pad={false}>
  <Screen>
    <div slot="main" id="emandate-inner">

      {#if currentView === Views.AUTH_SELECTION}
        <div id="emandate-bank">
          <div class="bank-icon">
            {#if $selectedBank}
              <img src={getBankLogo($selectedBank)} alt={bankName} />
            {/if}
          </div>
          <div class="bank-name">{bankName}</div>
          {#if !prefilledBank}
            <div class="btn-change-bank" on:click={resetBank}>Change Bank</div>
          {/if}
        </div>

        <div class="legend">Authenticate using</div>
        <div id="emandate-options">
          {#if _Arr.contains(availableAuthTypes, AuthTypes.DEBIT_CARD)}
            <div
              class="auth-option item debitcard"
              on:click={() => handleAuthTypeClicked(AuthTypes.DEBIT_CARD)}>
              <label>
                <i class="theme">
                  {@html icons.card}
                </i>
                Debit Card
                <span class="desc">
                  via Bank Account and Debit Card details
                </span>
              </label>
            </div>
          {/if}
          {#if _Arr.contains(availableAuthTypes, AuthTypes.NETBANKING)}
            <div
              class="auth-option item netbanking"
              on:click={() => handleAuthTypeClicked(AuthTypes.NETBANKING)}>
              <label>
                <i class="theme">
                  {@html icons.netbanking}
                </i>
                Netbanking
                <span class="desc">
                  via Bank Account and Netbanking details
                </span>
              </label>
            </div>
          {/if}
        </div>
      {:else if currentView === Views.BANK_DETAILS}
        <div class="emandate-fields">
          <AccountNumberField
            name="bank_account[account_number]"
            id="nb-acc-no"
            bankCode={$selectedBank}
            readonly={Boolean(prefillledBankAccount)}
            bind:value={$accountNumber} />

          <IfscField
            id="nb-acc-ifsc"
            name="bank_account[ifsc]"
            readonly={Boolean(prefilledIfsc)}
            bind:value={$ifsc} />

          <NameField
            id="nb-acc-name"
            name="bank_account[name]"
            readonly={Boolean(prefilledName)}
            bind:value={$name} />

          <div class="elem-wrap">
            <div class="elem select" class:readonly={prefilledAccountType}>
              <i class="select-arrow"></i>
              <div class="help">Please select a bank account type</div>
              <select
                name="bank_account[account_type]"
                required
                class="input"
                bind:value={$accountType}>
                {#if prefilledAccountType}
                  <option value={prefilledAccountType}>
                    {accountTexts[prefilledAccountType]}
                  </option>
                {:else}
                  <option value="">Type of Bank Account</option>
                  {#each accountTypes as type}
                    <option value={type}>{accountTexts[type]}</option>
                  {/each}
                {/if}
              </select>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </Screen>
</Tab>
