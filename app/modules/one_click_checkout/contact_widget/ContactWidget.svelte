<script>
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    CONTACT_LABEL,
    CHANGE_ACTION,
  } from 'one_click_checkout/contact_widget/i18n/labels';

  // Store Imports
  import { contact, isContactPresent, email } from 'checkoutstore/screens/home';
  import {
    isContactHidden,
    isEmailHidden,
    isContactEmailHidden,
  } from 'checkoutstore';
  import { isEditContactFlow } from 'one_click_checkout/store';

  // Utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';

  // Constant Imports
  import { views } from 'one_click_checkout/routing/constants';

  let showUserDetailsStrip;
  let showEditUserDetails = !$isContactPresent && !$email;

  $: {
    showUserDetailsStrip =
      ($isContactPresent || $email) && !isContactEmailHidden();
  }
  const { user } = getIcons();

  function editContact() {
    isEditContactFlow.set(true);
    navigator.navigateTo({ path: views.DETAILS });
  }
</script>

{#if showUserDetailsStrip || showEditUserDetails}
  <div class="contact-container">
    <div class="contact-header">
      <div class="contact-title">
        <Icon icon={user} />
        <span class="contact-text">{$t(CONTACT_LABEL)}</span>
      </div>
      {#if !showEditUserDetails}
        <div class="contact-edit theme" on:click={editContact}>
          {$t(CHANGE_ACTION)}
        </div>
      {/if}
    </div>
    {#if showEditUserDetails}
      <div>
        <PaymentDetails />
      </div>
    {:else}
      <div class="contact-info">
        {#if $isContactPresent && !isContactHidden()}
          <div class="phone-text">{$contact}</div>
        {/if}
        {#if $email && !isEmailHidden()}
          <div class="email-text">{$email}</div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .contact-title {
    display: flex;
    align-items: center;
  }
  .contact-text {
    padding-left: 10px;
    font-weight: 600;
    font-size: 14px;
  }
  .contact-edit {
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
  }
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .contact-info {
    padding: 14px 0px 0px;
  }
  .phone-text {
    line-height: 20px;
  }
  .email-text {
    color: #8d97a1;
    padding-top: 4px;
    line-height: 20px;
  }
</style>
