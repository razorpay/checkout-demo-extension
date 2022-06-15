<script lang="ts">
  import { getSession } from 'sessionmanager';

  // UI Imports
  import Screen from 'ui/layouts/Screen.svelte';
  import Tab from 'ui/tabs/Tab.svelte';

  import AccountNumberField from 'ui/elements/fields/emandate/AccountNumberField.svelte';
  import IfscField from 'ui/elements/fields/emandate/IfscField.svelte';
  import NameField from 'ui/elements/fields/emandate/NameField.svelte';
  import { getDirectionForField } from 'ui/elements/fields/helpers';
  // Svelte imports
  import { fade } from 'svelte/transition';

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
    isEMandateAuthTypeEnabled,
    isEMandateBankEnabled,
  } from 'checkoutstore/methods';

  // i18n
  import { locale, t } from 'svelte-i18n';
  import { getLongBankName } from 'i18n';

  import {
    CHANGE_BANK_BTN,
    AUTH_TYPE_HEADER,
    AUTH_TYPE_DEBIT_TITLE,
    AUTH_TYPE_DEBIT_DESCRIPTION,
    AUTH_TYPE_NETBANKING_TITLE,
    AUTH_TYPE_NETBANKING_DESCRIPTION,
    AUTH_TYPE_AADHAAR_TITLE,
    AUTH_TYPE_AADHAAR_DESCRIPTION,
    ACCOUNT_TYPE_CURRENT,
    ACCOUNT_TYPE_SAVINGS,
    ACCOUNT_TYPE_LABEL,
    ACCOUNT_TYPE_HELP,
  } from 'ui/labels/emandate';

  // Utils
  import { getBankLogo } from 'common/bank';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';
  import { getAnimationOptions } from 'svelte-utils';
  import {
    getAuthType,
    getPrefillBank,
    getPrefillBankDetails,
  } from 'netbanking/helper';
  import { getThemeMeta } from 'checkoutstore/theme';

  const session = getSession();

  // Prefill
  const prefilledBank = getPrefillBank();
  const prefillledBankAccount = getPrefillBankDetails('account_number');

  const prefilledName = getPrefillBankDetails('name');
  const prefilledIfsc = getPrefillBankDetails('ifsc');
  const prefilledAuthType = getAuthType();

  const isPrefilledBankAvailable =
    prefilledBank && isEMandateBankEnabled(prefilledBank);
  const isPrefilledAuthTypeAvailable =
    prefilledAuthType &&
    isEMandateAuthTypeEnabled(prefilledBank, prefilledAuthType);

  let prefilledAccountType = getPrefillBankDetails('account_type');

  const AuthTypes = {
    NETBANKING: 'netbanking',
    DEBIT_CARD: 'debitcard',
    AADHAAR: 'aadhaar',
  };

  const accountTextLabels = {
    savings: ACCOUNT_TYPE_SAVINGS,
    current: ACCOUNT_TYPE_CURRENT,
  };
  const accountTypes = Object.keys(accountTextLabels);

  if (!accountTypes.includes(prefilledAccountType)) {
    prefilledAccountType = '';
  }

  // Set prefill
  $accountNumber = prefillledBankAccount;
  $name = prefilledName;
  $ifsc = prefilledIfsc;
  $accountType = prefilledAccountType;
  $authType = prefilledAuthType;

  // set field directions
  const dir = getDirectionForField();
  // Set tab title overrides
  session.topBar.setTitleOverride('netbanking', 'text', 'emandate_account');

  function setInitialState() {
    if (isPrefilledBankAvailable) {
      $selectedBank = prefilledBank;
    }

    if (isPrefilledAuthTypeAvailable) {
      $authType = prefilledAuthType;
    }

    const availableAuthTypes = getEMandateAuthTypes($selectedBank);
    if (availableAuthTypes.length === 1) {
      $authType = availableAuthTypes[0];
    }
  }

  function determineLandingView() {
    let view = Views.AUTH_SELECTION;

    if (shouldSkipAuthSelection()) {
      view = Views.BANK_DETAILS;
    }

    return view;
  }

  function showLandingView() {
    setView(determineLandingView());
  }

  function shouldSkipAuthSelection() {
    return (
      (isPrefilledBankAvailable && isPrefilledAuthTypeAvailable) ||
      getEMandateAuthTypes($selectedBank).length === 1
    );
  }

  export function onShown() {
    active = true;
    setInitialState();
    showLandingView();
    setCtaVisibility(currentView);
  }

  export function onBack() {
    Analytics.track('emandate:back', {
      type: AnalyticsTypes.BEHAV,
      data: {
        auth_type: $authType,
      },
    });

    const shouldGoToNBScreen =
      !isPrefilledBankAvailable &&
      (currentView === Views.AUTH_SELECTION || shouldSkipAuthSelection());

    if (shouldGoToNBScreen) {
      $selectedBank = '';
      active = false;
      session.switchTab('netbanking');
      return true;
    }

    if (currentView === Views.BANK_DETAILS) {
      if (shouldSkipAuthSelection()) {
        active = false;
        return false;
      }

      setView(Views.AUTH_SELECTION);
      active = true;
      return true;
    }

    active = false;
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

  const banks = getEMandateBanks();

  let currentView = Views.AUTH_SELECTION;

  let bankName;
  $: {
    const defaultBankName = (banks[selectedBank] || {}).name;
    bankName = getLongBankName($selectedBank, $locale, defaultBankName);
  }

  let active = false;

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
    if (active) {
      setCtaVisibility(currentView);
    }
  }

  function setCtaVisibility(view) {
    setTimeout(() => {
      if (view !== Views.BANK_DETAILS) {
        hideCta();
      } else {
        showCtaWithDefaultText();
      }
    });
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

  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;
</script>

<Tab method="emandate" overrideMethodCheck pad={false}>
  <Screen>
    <div id="emandate-inner">
      {#if currentView === Views.AUTH_SELECTION}
        <div
          class="emandate-auth-selection"
          in:fade={getAnimationOptions({ duration: 200, delay: 200 })}
        >
          <div id="emandate-bank">
            <div class="bank-icon">
              {#if $selectedBank}
                <img src={getBankLogo($selectedBank)} alt="" />
              {/if}
            </div>
            <div class="bank-name">{bankName}</div>
            {#if !prefilledBank}
              <div class="btn-change-bank" on:click={resetBank}>
                <!-- LABEL: Change Bank -->
                {$t(CHANGE_BANK_BTN)}
              </div>
            {/if}
          </div>

          <!-- LABEL: Authenticate using -->
          <div class="legend">{$t(AUTH_TYPE_HEADER)}</div>
          <div id="emandate-options">
            {#if isEMandateAuthTypeEnabled($selectedBank, AuthTypes.DEBIT_CARD)}
              <div
                class="auth-option item debitcard"
                on:click={() => handleAuthTypeClicked(AuthTypes.DEBIT_CARD)}
              >
                <label>
                  <i class="theme">
                    {@html icons.card}
                  </i>
                  <!-- LABEL: Debit Card -->
                  {$t(AUTH_TYPE_DEBIT_TITLE)}
                  <span class="desc">
                    <!-- LABEL: via Bank Account and Debit Card details -->
                    {$t(AUTH_TYPE_DEBIT_DESCRIPTION)}
                  </span>
                </label>
              </div>
            {/if}
            {#if isEMandateAuthTypeEnabled($selectedBank, AuthTypes.NETBANKING)}
              <div
                class="auth-option item netbanking"
                on:click={() => handleAuthTypeClicked(AuthTypes.NETBANKING)}
              >
                <label>
                  <i class="theme">
                    {@html icons.netbanking}
                  </i>
                  <!-- LABEL: Netbanking -->
                  {$t(AUTH_TYPE_NETBANKING_TITLE)}
                  <span class="desc">
                    <!-- LABEL: via Bank Account and Netbanking details -->
                    {$t(AUTH_TYPE_NETBANKING_DESCRIPTION)}
                  </span>
                </label>
              </div>
            {/if}
            {#if isEMandateAuthTypeEnabled($selectedBank, AuthTypes.AADHAAR)}
              <div
                class="auth-option item aadhaar"
                on:click={() => handleAuthTypeClicked(AuthTypes.AADHAAR)}
              >
                <label>
                  <i class="theme">
                    {@html icons.aadhaar}
                  </i>
                  <!-- LABEL: Aadhaar -->
                  {$t(AUTH_TYPE_AADHAAR_TITLE)}
                  <span class="desc">
                    <!-- LABEL: via Bank Account and Aadhaar VID -->
                    {$t(AUTH_TYPE_AADHAAR_DESCRIPTION)}
                  </span>
                </label>
              </div>
            {/if}
          </div>
        </div>
      {:else if currentView === Views.BANK_DETAILS}
        <div
          class="emandate-fields"
          in:fade={getAnimationOptions({ duration: 200, delay: 200 })}
        >
          <AccountNumberField
            name="bank_account[account_number]"
            id="nb-acc-no"
            bankCode={$selectedBank}
            readonly={Boolean(prefillledBankAccount)}
            bind:value={$accountNumber}
            {dir}
          />

          <IfscField
            id="nb-acc-ifsc"
            name="bank_account[ifsc]"
            readonly={Boolean(prefilledIfsc)}
            bind:value={$ifsc}
            {dir}
          />

          <NameField
            id="nb-acc-name"
            name="bank_account[name]"
            readonly={Boolean(prefilledName)}
            bind:value={$name}
            {dir}
          />

          <div class="elem-wrap">
            <div class="elem select" class:readonly={prefilledAccountType}>
              <i class="select-arrow"></i>
              <!-- LABEL: Please select a bank account type -->
              <div class="help">{$t(ACCOUNT_TYPE_HELP)}</div>
              <select
                name="bank_account[account_type]"
                required
                class="input"
                bind:value={$accountType}
              >
                {#if prefilledAccountType}
                  <option value={prefilledAccountType}>
                    {$t(accountTextLabels[prefilledAccountType])}
                  </option>
                {:else}
                  <!-- LABEL: Type of Bank Account -->
                  <option value="">{$t(ACCOUNT_TYPE_LABEL)}</option>
                  {#each accountTypes as type (type)}
                    <option value={type}>{$t(accountTextLabels[type])}</option>
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

  .auth-option label:after {
    content: '\e604';
    position: absolute;
    right: 16px;
    top: 20px;
    transform: scaleX(-1);
    color: #777;
  }

  .emandate-auth-selection {
    padding-top: 12px;
  }

  #emandate-inner {
    padding: 0 12px;
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
