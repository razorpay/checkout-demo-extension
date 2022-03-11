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
  import { isUserLoggedIn } from 'common/helpers/customer';

  // analytics imports
  import { Events, MiscEvents } from 'analytics';

  let isLoggedIn;
  let showLanguageList;

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

  export function show() {
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
      target: document.querySelector('#footer'),
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
    <div class="account-heading-container">
      <div id="account-heading" class="account-heading">
        {$t(ACCOUNT)}
        {#if showLanguageList}
          <span class="language-selection">{$t(CHANGE_LANGUAGE)}</span>
        {/if}
      </div>
      <div class="account-toggle-icon" on:click={hide}>
        <Icon icon={arrow_left(13, 13, '#212121')} />
      </div>
    </div>
    <hr />
    {#if showLanguageList}
      <div class="back-btn-container" on:click={handleBack}>
        <span class="back-btn-icon">
          <Icon icon={arrow_left(11, 11, '#616161')} />
        </span>
        <span class="back-btn-text">{$t(BACK)}</span>
      </div>
      <div class="language-container">
        {#each $locales as locale}
          <div class="account-menu" on:click={() => selectLanguage(locale)}>
            {getLocaleName(locale)}
          </div>
        {/each}
      </div>
    {:else}
      {#if isLoggedIn}
        <div class="account-menu" on:click={handleEdit}>
          {$t(EDIT_CONTACT_ACTION)}
        </div>
      {/if}
      {#if showChangeLanguage}
        <div class="account-menu" on:click={handleChangeLanguage}>
          {$t(CHANGE_LANGUAGE)}: {getLocaleName($locale)}
          <span class="language-btn">
            <Icon icon={arrow_left(11, 11, '#616161')} />
          </span>
        </div>
      {/if}
      {#if isLoggedIn}
        <hr class="account-separator" />
        <div class="account-menu" on:click={handleLogoutClick}>
          {$t(LOGOUT_ACTION)}
        </div>
        <div class="account-menu" on:click={handleLogoutAllDevicesClick}>
          {$t(LOGOUT_ALL_DEVICES_ACTION)}
        </div>
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
    padding: 24px;
  }
  .account-menu {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
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
  }
  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  hr {
    margin-bottom: 18px;
    border: 1px solid #e1e5ea;
    border-bottom: none;
  }
  .account-separator {
    margin: 26px 0px;
  }
  .account-container {
    text-align: left;
  }
  .language-container {
    overflow-y: scroll;
    max-height: 140px;
  }
  .back-btn-container {
    color: #616161;
    font-size: 12px;
    padding: 0px 0px 18px 6px;
    display: flex;
    align-items: center;
  }
  .account-toggle-icon {
    width: 14px;
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
</style>
