<script>
  import { getSession } from 'sessionmanager';

  // UI Imports
  import AccountNumberField from 'ui/elements/fields/emandate/AccountNumberField.svelte';
  import IfscField from 'ui/elements/fields/emandate/IfscField.svelte';
  import NameField from 'ui/elements/fields/emandate/NameField.svelte';

  // Store imports
  import {
    accountNumber,
    bankName,
    ifsc,
    accountType,
  } from 'checkoutstore/screens/emandate';

  const session = getSession();

  // Prefill
  const prefilledBank = session.get('prefill.bank');
  const prefillledBankAccount = session.get(
    'prefill.bank_account[account_number]'
  );
  const prefilledName = session.get('prefill.bank_account[name]');
  const prefilledIfsc = session.get('prefill.bank_account[ifsc]');

  var prefilledAccountType = session.get('prefill.bank_account[account_type]');
  var accountTexts = {
    savings: 'Savings Account',
    current: 'Current Account',
  };
  var accountTypes = _Obj.keys(accountTexts);

  if (!_Arr.contains(accountTypes, prefilledAccountType)) {
    prefilledAccountType = false;
  }

  // Set prefill
  $accountNumber = prefillledBankAccount;
  $bankName = prefilledName;
  $ifsc = prefilledIfsc;
  $accountType = prefilledAccountType;

  const icons = session.themeMeta.icons;
</script>

<div id="emandate-inner">

  <div id="form-emandate-auth-selection" class="tab-content showable screen">
    <div id="emandate-bank">
      <div class="bank-icon" />
      <div class="bank-name">HDFC Bank</div>
      {#if !prefilledBank}
        <div class="btn-change-bank">Change Bank</div>
      {/if}
    </div>

    <div class="legend">Authenticate using</div>
    <div id="emandate-options" class="grid clear count-2">
      <div class="auth-option item debitcard">
        <label>
          <i class="theme">
            {@html icons.card}
          </i>
          Debit Card
          <span class="desc">via Bank Account and Debit Card details</span>
        </label>
      </div>
      <div class="auth-option item netbanking">
        <label>
          <i class="theme">
            {@html icons.netbanking}
          </i>
          Netbanking
          <span class="desc">via Bank Account and Netbanking details</span>
        </label>
      </div>

    </div>
  </div>

  <div id="form-emandate-details" class="tab-content showable screen pad">

    <AccountNumberField
      name="bank_account[account_number]"
      id="nb-acc-no"
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
      bind:value={$bankName} />

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
</div>
