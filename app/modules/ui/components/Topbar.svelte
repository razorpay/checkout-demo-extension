<script>
  // Svelte imports
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // Store
  import { isContactPresent } from 'checkoutstore/screens/home';

  // Utils
  import { getSession } from 'sessionmanager';

  const session = getSession();
  const dispatch = createEventDispatcher();

  let shown = false;
  let userDetailsShown = true;
  let logged = false;
  let logoutDropdownShown = false;
  let contact = '';

  let title = '';

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

  export function setTitle(newTitle) {
    title = newTitle;
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
      <div id="tab-title">{title}</div>
    </div>
  </div>
{/if}
