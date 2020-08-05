<script>
  // Svelte imports
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  // Store
  import { isIRCTC } from 'checkoutstore';
  import { isContactPresent } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getTabTitle } from 'i18n';

  import { LOGOUT_ACTION, LOGOUT_ALL_DEVICES_ACTION } from 'ui/labels/topbar';

  // Utils
  import { getSession } from 'sessionmanager';
  import { getAnimationOptions } from 'svelte-utils';

  const session = getSession();
  const dispatch = createEventDispatcher();

  let shown = false;
  let userDetailsShown = true;
  let logged = false;
  let logoutDropdownShown = false;
  let contact = '';

  // TODO: refactor this into a separate tab title store.
  /**
   * Overrides for the tab title. The key is the tab name, value is an object
   * with `type` and `data`.
   *
   * type=image means that an image is to be shown, which has the url `data`.
   * type=text means that the title of an alternate tab is to be shown, the name
   * of which is denoted by `data`.
   */
  const titleOverrides = {};

  let tab = '';

  export function setTab(newTab) {
    tab = newTab;
  }

  export function setTitleOverride(screen, type, data) {
    titleOverrides[screen] = {
      type,
      data,
    };
  }

  export function resetTitleOverride(screen) {
    delete titleOverrides[screen];
  }

  function setOverridesForIrctc() {
    setTitleOverride('upi', 'text', 'irctc_upi');
    setTitleOverride('card', 'text', 'irctc_card');
  }

  function generateOverriddenTitle(tab, locale) {
    const override = titleOverrides[tab];

    if (!override) {
      return getTabTitle(tab, locale);
    }

    if (override.type === 'image') {
      return `<img src=${override.data} alt="">`;
    } else {
      return getTabTitle(override.data, locale);
    }
  }

  export function show() {
    shown = true;
  }

  export function hide() {
    shown = false;
  }

  export function showUserDetails() {
    userDetailsShown = true;
  }

  export function hideUserDetails() {
    userDetailsShown = false;
  }

  export function setLogged(isLogged) {
    logged = isLogged;
  }

  export function setContact(newContact) {
    contact = newContact;
  }

  function handleBackClick() {
    dispatch('back');
  }

  function handleUserDetailsClick() {
    if (logged) {
      logoutDropdownShown = !logoutDropdownShown;
    }
  }

  function handleLogoutClick() {
    session.logUserOut(session.getCurrentCustomer());
    logoutDropdownShown = false;
  }

  function handleLogoutAllDevicesClick() {
    session.logUserOutOfAllDevices(session.getCurrentCustomer());
    logoutDropdownShown = false;
  }

  function handleOutsideClick() {
    if (logoutDropdownShown) {
      logoutDropdownShown = false;
    }
  }

  onMount(() => {
    if (isIRCTC()) {
      setOverridesForIrctc();
    }
    document.body.addEventListener('click', handleOutsideClick);
  });

  onDestroy(() => {
    document.body.removeEventListener('click', handleOutsideClick);
  });
</script>

{#if shown}
  <div
    id="topbar"
    class="theme-secondary-highlight"
    transition:fly={getAnimationOptions({ y: -46, duration: 200 })}>
    {#if $isContactPresent && userDetailsShown}
      <div
        id="top-right"
        class:logged
        on:click|stopPropagation={handleUserDetailsClick}>
        <div id="user">{contact}</div>
        {#if logoutDropdownShown}
          <div id="profile">
            <!-- LABEL: Log out -->
            <li on:click={handleLogoutClick}>{$t(LOGOUT_ACTION)}</li>
            <!-- LABEL: Log out from all devices -->
            <li on:click={handleLogoutAllDevicesClick}>
              {$t(LOGOUT_ALL_DEVICES_ACTION)}
            </li>
          </div>
        {/if}
      </div>
    {/if}
    <div id="top-left" on:click={handleBackClick}>
      <i class="back">&#xe604;</i>
      <div id="tab-title">
        {@html generateOverriddenTitle(tab, $locale)}
      </div>
    </div>
  </div>
{/if}
