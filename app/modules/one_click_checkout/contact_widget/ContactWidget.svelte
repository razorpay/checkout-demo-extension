<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import ConsentCheckbox from 'one_click_checkout/customer/ui/ConsentCheckbox.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    CONTACT_LABEL,
    CHANGE_ACTION,
  } from 'one_click_checkout/contact_widget/i18n/labels';

  // Store Imports
  import {
    contact,
    isContactPresent,
    email,
    country,
  } from 'checkoutstore/screens/home';
  import {
    isContactHidden,
    isEmailHidden,
    isContactEmailHidden,
  } from 'razorpay';
  import { isEditContactFlow } from 'one_click_checkout/store';

  // Analytics
  import { Events } from 'analytics';
  import SummaryEvents from 'one_click_checkout/coupons/analytics';

  // Utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { findCountryCode } from 'common/countrycodes';

  // Constant Imports
  import { views } from 'one_click_checkout/routing/constants';

  // Svelte imports
  import { isContactAndEmailValid } from 'one_click_checkout/common/details/store';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';

  let showUserDetailsStrip = false;
  let showEditUserDetails = false;
  let phoneCode = '';
  let phoneNum = '';
  export let showValidations = false;
  export let valid = false;

  let inputFieldsValid = false;

  $: valid = showEditUserDetails ? inputFieldsValid : true;

  $: {
    showUserDetailsStrip =
      Boolean($isContactPresent || $email) && !isContactEmailHidden();
  }

  $: {
    ({ code: phoneCode, phone: phoneNum } = findCountryCode($contact));
  }

  const userIcon = getIcons().user as string;

  function editContact() {
    Events.TrackBehav(SummaryEvents.SUMMARY_CONTACT_CHANGE_CLICKED);
    isEditContactFlow.set(true);
    navigator.navigateTo({ path: views.DETAILS });
  }

  $: showEditUserDetails = !$isContactAndEmailValid || !isUserLoggedIn();
</script>

{#if showUserDetailsStrip || showEditUserDetails}
  <div class="contact-container">
    <div class="contact-header">
      <div class="contact-title">
        <Icon icon={userIcon} />
        <span class="contact-text">{$t(CONTACT_LABEL)}</span>
      </div>
      {#if !showEditUserDetails}
        <div
          data-test-id="edit-contact"
          class="contact-edit theme"
          on:click={editContact}
        >
          {$t(CHANGE_ACTION)}
        </div>
      {/if}
    </div>
    {#if showEditUserDetails}
      <div>
        <PaymentDetails {showValidations} />
      </div>
    {:else}
      <div class="contact-info">
        {#if $isContactPresent && !isContactHidden()}
          <div class="phone-text">+{phoneCode} {phoneNum}</div>
        {/if}
        {#if $email && !isEmailHidden()}
          <div class="email-text">{$email}</div>
        {/if}
      </div>
    {/if}
    <ConsentCheckbox />
  </div>
{/if}

<style>
  .contact-title {
    display: flex;
    align-items: center;
  }
  .contact-text {
    padding-left: 10px;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
  }
  .contact-edit {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    cursor: pointer;
  }
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
  }
  .contact-info {
    color: var(--secondary-text-color);
    padding: 14px 0px 0px;
  }
  .phone-text {
    font-weight: var(--font-weight-medium);
    line-height: 20px;
  }
  .email-text {
    padding-top: 4px;
    line-height: 20px;
  }
</style>
