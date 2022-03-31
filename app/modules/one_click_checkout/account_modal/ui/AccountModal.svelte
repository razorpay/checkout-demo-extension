<script>
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Backdrop from 'one_click_checkout/common/ui/Backdrop.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import Loader from 'one_click_checkout/account_modal/ui/Loader.svelte';
  import arrow_left from 'one_click_checkout/account_modal/icons/arrow_left';

  // utils Imports
  import { handleEditContact } from 'one_click_checkout/sessionInterface';
  import {
    handleLogout,
    handleLogoutAllDevices,
    getSessionTab,
  } from 'one_click_checkout/account_modal/sessionInterface';

  // store imports
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { shouldUseVernacular } from 'checkoutstore/methods';

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

  // helper imports
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';

  // analytics imports
  import { Events, MiscEvents } from 'analytics';
  import { ACCOUNT_VARIANT } from 'one_click_checkout/account_modal/constants';

  let isLoggedIn;
  let showLanguageList;

  let variant = ACCOUNT_VARIANT.DEFAULT;

  const showChangeLanguage = shouldUseVernacular();
  let visible = false;

  function handleLogoutAnalytics() {
    const tab = getSessionTab();
    const current_screen =
      tab === 'home-1cc' ? $activeRoute.name : tab || 'methods';
    Events.Track(MiscEvents.LOGOUT_CLICKED, {
      current_screen,
    });
  }

  export function show(options) {
    const { variant: variantType } = options || {};
    variant = variantType;
    isLoggedIn = isUserLoggedIn();
    showLanguageList = false;
    visible = true;
  }

  export function hide() {
    visible = false;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      hide();
    }
  }

  function handleLogoutClick() {
    handleLogout();
    handleLogoutAnalytics();
    hide();
  }

  onMount(() => {
    new Loader({
      target: document.querySelector('#one-cc-account'),
    });
  });

  function handleLogoutAllDevicesClick() {
    handleLogoutAllDevices();
    handleLogoutAnalytics();
    hide();
  }

  function handleChangeLanguage() {
    showLanguageList = true;
  }

  function selectLanguage(code) {
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
          <li class="list-item" on:click={() => selectLanguage(locale)}>
            <button class="account-menu">
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
            <li class="list-item" on:click={() => selectLanguage(locale)}>
              <button class="account-menu">
                {getLocaleName(locale)}
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        {#if isLoggedIn}
          <p class="account-menu" on:click={handleEdit}>
            {$t(EDIT_CONTACT_ACTION)}
          </p>
        {/if}
        {#if showChangeLanguage}
          <p class="account-menu" on:click={handleChangeLanguage}>
            {$t(CHANGE_LANGUAGE)}: {getLocaleName($locale)}
            <span class="language-btn">
              <Icon icon={arrow_left(11, 11, '#616161')} />
            </span>
          </p>
        {/if}
        {#if isLoggedIn}
          <hr class="account-separator" />
          <p class="account-menu" on:click={handleLogoutClick}>
            {$t(LOGOUT_ACTION)}
          </p>
          <p class="account-menu" on:click={handleLogoutAllDevicesClick}>
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

  .list-item {
    cursor: pointer;
  }
</style>
