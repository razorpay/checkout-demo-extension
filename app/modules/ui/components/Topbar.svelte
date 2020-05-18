<script>
  // Svelte imports
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // Store
  import { isContactPresent } from 'checkoutstore/screens/home';
  import { locale } from 'svelte-i18n';
  import { getTabTitle } from 'i18n';

  // Utils
  import { getSession } from 'sessionmanager';

  const session = getSession();
  const dispatch = createEventDispatcher();

  let shown = false;
  let userDetailsShown = true;
  let logged = false;
  let logoutDropdownShown = false;
  let contact = '';

  // TODO: refactor this into a separate tab title store.
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
  }

  function handleLogoutAllDevicesClick() {
    session.logUserOutOfAllDevices(session.getCurrentCustomer());
  }

  function handleOutsideClick() {
    if (logoutDropdownShown) {
      logoutDropdownShown = false;
    }
  }

  onMount(() => {
    document.body.addEventListener('click', handleOutsideClick);
  });

  onDestroy(() => {
    document.body.removeEventListener('click', handleOutsideClick);
  });
</script>

{#if shown}
  <div id="topbar" class="theme-secondary-highlight">
    {#if $isContactPresent && userDetailsShown}
      <div
        id="top-right"
        class:logged
        on:click|stopPropagation={handleUserDetailsClick}>
        <div id="user">{contact}</div>
        {#if logoutDropdownShown}
          <div id="profile">
            <li on:click={handleLogoutClick}>Log out</li>
            <li on:click={handleLogoutAllDevicesClick}>
              Log out from all devices
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
