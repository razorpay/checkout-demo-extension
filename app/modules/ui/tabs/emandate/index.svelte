<script>
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

  import { getEMandateBanks } from 'checkoutstore/methods';

  // Utils
  import { getBankLogo } from 'common/bank';

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

  function getAuthTypes(bankCode) {
    return (banks[bankCode] || {}).auth_types || [];
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
    availableAuthTypes = getAuthTypes($selectedBank);
  }

  const banks = getEMandateBanks();

  function resetBankIfNotPrefilled() {
    if (!prefilledBank) {
      session.switchTab('netbanking');
      // TODO: is there a better way?
      // Wait for transition to complete before resetting bank
      setTimeout(() => {
        $selectedBank = '';
      }, 200);
    }
  }

  function setAuthType(newAuthType) {
    $authType = newAuthType;
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

  .auth-option.item {
    width: auto;
    float: none;
    border: 0;
    text-align: left;
  }

  .auth-option.item i {
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
            <img src={getBankLogo($selectedBank)} alt={bankName} />
          </div>
          <div class="bank-name">{bankName}</div>
          {#if !prefilledBank}
            <div class="btn-change-bank" on:click={resetBankIfNotPrefilled}>
              Change Bank
            </div>
          {/if}
        </div>

        <div class="legend">Authenticate using</div>
        <div id="emandate-options" class="grid clear count-2">
          {#if _Arr.contains(availableAuthTypes, 'debitcard')}
            <div class="auth-option item debitcard">
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
          {#if _Arr.contains(availableAuthTypes, 'netbanking')}
            <div class="auth-option item netbanking">
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
      {/if}

    </div>
  </Screen>
</Tab>
