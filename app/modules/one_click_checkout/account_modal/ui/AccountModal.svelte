<script>
  // svelte imports
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  // UI Imports
  import Backdrop from 'one_click_checkout/common/ui/Backdrop.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import Loader from 'one_click_checkout/account_modal/ui/Loader.svelte';
  import arrow_left from 'one_click_checkout/account_modal/icons/arrow_left';

  // utils Imports
  import { handleEditContact } from 'one_click_checkout/sessionInterface';

  // store imports
  import { shouldUseVernacular } from 'checkoutstore/methods';
  import { contact as contactStore } from 'checkoutstore/screens/home';

  // i18n imports
  import { getBundle } from 'i18n';
  import { t, locale, locales } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';
  import {
    LOGOUT_ACTION,
    LOGOUT_ALL_DEVICES_ACTION,
    EDIT_CONTACT_ACTION,
  } from 'ui/labels/topbar';
  import {
    ACCOUNT,
    CHANGE_LANGUAGE,
    BACK,
  } from 'one_click_checkout/account_modal/i18n/labels';
  import { logUserOut } from 'checkoutframe/customer';

  // helper imports
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  // analytics imports
  import { Events } from 'analytics';
  import { ACCOUNT_VARIANT } from 'one_click_checkout/account_modal/constants';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import AccountEvents from 'one_click_checkout/account_modal/analytics';

  let isLoggedIn;
  let showLanguageList;

  let variant = ACCOUNT_VARIANT.DEFAULT;

  const showChangeLanguage = shouldUseVernacular();
  let screen_name;
  let visible = false;

  export function show(options) {
    screen_name = getCurrentScreen();
    const { variant: variantType } = options || {};
    variant = variantType;
    isLoggedIn = isUserLoggedIn();
    showLanguageList = false;
    visible = true;
  }

  export function hide() {
    Events.TrackBehav(AccountEvents.SCREEN_DISMISSED, { screen_name });
    visible = false;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      hide();
    }
  }

  function handleLogoutClick() {
    Events.TrackBehav(AccountEvents.LOGOUT_CLICKED, { screen_name });
    logUserOut(get(contactStore), false, handleEditContact.bind(null, true));
    hide();
  }

  onMount(() => {
    new Loader({
      target: document.querySelector('#one-cc-account'),
    });
  });

  function handleLogoutAllDevicesClick() {
    Events.TrackBehav(AccountEvents.LOGOUT_ALL_DEVICES_CLICKED, {
      screen_name,
    });
    logUserOut(get(contactStore), true, handleEditContact.bind(null, true));
    hide();
  }

  function handleChangeLanguage() {
    showLanguageList = true;
  }

  function selectLanguage(code) {
    if (variant === ACCOUNT_VARIANT.LANGUAGE_ONLY) {
      Events.TrackBehav(CouponEvents.SUMMARY_LANGUAGE_CHANGED, {
        new_language_selected: code,
      });
    }
    Events.TrackBehav(AccountEvents.LANGUAGE_CLICKED, { screen_name });
    $locale = code;
    // In order to insure the bottom sheet get closes...when different language is chosen
    if (Object.keys(getBundle(code))?.length) {
      hide();
    }
    showLanguageList = false;
  }

  function handleBack() {
    showLanguageList = false;
  }

  function handleEdit() {
    Events.TrackBehav(AccountEvents.EDIT_PERSONAL_DETAILS_CLICKED, {
      screen_name,
    });
    handleEditContact(false);
    hide();
  }
</script>

<Backdrop {visible} on:click={handleBackdropClick}>
  <div class="account-container">
    {#if variant === ACCOUNT_VARIANT.LANGUAGE_ONLY}
      <div class="account-heading-container">
        <p class="account-heading">
          {$t(CHANGE_LANGUAGE)}
        </p>
        <button class="account-toggle-icon" on:click={hide}>
          <Icon icon={arrow_left(13, 13, '#212121')} />
        </button>
      </div>
      <hr />
      <ul class="language-container">
        {#each $locales as locale}
          <li class="list-item">
            <button
              class="account-menu"
              data-test-id="lang-{getLocaleName(locale)}"
              on:click={() => selectLanguage(locale)}
            >
              {getLocaleName(locale)}
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="account-heading-container">
        <p class="account-heading">
          {$t(ACCOUNT)}
          {#if showLanguageList}
            <span class="language-selection">{$t(CHANGE_LANGUAGE)}</span>
          {/if}
        </p>
        <button class="account-toggle-icon" on:click={hide}>
          <Icon icon={arrow_left(13, 13, '#212121')} />
        </button>
      </div>
      <hr />
      {#if showLanguageList}
        <button class="back-btn-container" on:click={handleBack}>
          <span class="back-btn-icon">
            <Icon icon={arrow_left(11, 11, '#616161')} />
          </span>
          <span class="back-btn-text">{$t(BACK)}</span>
        </button>
        <ul class="language-container">
          {#each $locales as locale}
            <li class="list-item">
              <button
                class="account-menu"
                data-test-id="lang-{getLocaleName(locale)}"
                on:click={() => selectLanguage(locale)}
              >
                {getLocaleName(locale)}
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        {#if isLoggedIn}
          <p
            data-test-id="edit-contact-account"
            class="account-menu"
            on:click={handleEdit}
          >
            {$t(EDIT_CONTACT_ACTION)}
          </p>
        {/if}
        {#if showChangeLanguage}
          <p
            data-test-id="account-lang-cta"
            class="account-menu"
            on:click={handleChangeLanguage}
          >
            {$t(CHANGE_LANGUAGE)}: {getLocaleName($locale)}
            <span class="language-btn">
              <Icon icon={arrow_left(11, 11, '#616161')} />
            </span>
          </p>
        {/if}
        {#if isLoggedIn}
          <hr class="account-separator" />
          <p
            data-test-id="account-logout-cta"
            class="account-menu"
            on:click={handleLogoutClick}
          >
            {$t(LOGOUT_ACTION)}
          </p>
          <p
            data-test-id="account-logoutall-cta"
            class="account-menu"
            on:click={handleLogoutAllDevicesClick}
          >
            {$t(LOGOUT_ALL_DEVICES_ACTION)}
          </p>
        {/if}
      {/if}
    {/if}
  </div>
</Backdrop>

<style>
  .account-container {
    box-sizing: border-box;
    position: absolute;
    background: #fff;
    text-align: start;
    width: 100%;
    padding: 16px 0px;
    bottom: -55px;
  }
  .account-menu {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    padding: 0px 16px;
  }

  .account-heading {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
  }
  .account-heading-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 16px;
  }
  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  hr {
    border: 1px solid #e1e5ea;
    border-bottom: none;
    margin: 12px 16px;
  }

  .account-container {
    text-align: left;
  }
  .language-container {
    overflow-y: scroll;
    max-height: 140px;
    list-style: none;
    padding-inline-start: 0px;
    margin: 0px;
  }
  .back-btn-container {
    color: #616161;
    font-size: 12px;
    padding: 0px 24px 18px;
    display: flex;
    align-items: center;
  }
  .account-toggle-icon {
    height: 14px;
    transform: rotate(270deg);
    cursor: pointer;
  }
  .back-btn-text {
    padding-left: 10px;
    padding-bottom: 2px;
    cursor: pointer;
  }
  .back-btn-icon {
    cursor: pointer;
  }
  .language-btn {
    transform: rotate(180deg);
    cursor: pointer;
  }
  :global(.mobile) .account-container {
    bottom: 0;
  }
  .language-selection {
    color: #616161;
    font-size: 12px;
    font-weight: 300;
    padding-left: 10px;
  }

  .list-item .account-menu {
    width: 100%;
    border-radius: 0px;
    color: #424242;
    font-size: 14px;
  }
</style>
