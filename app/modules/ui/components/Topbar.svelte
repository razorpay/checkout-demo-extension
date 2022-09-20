<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { fly } from 'svelte/transition';

  // Store
  import { showFeeLabel } from 'checkoutstore/fee';
  import { getAmount, isIRCTC, isRedesignV15 } from 'razorpay';
  import {
    isContactPresent,
    contact as contactStore,
  } from 'checkoutstore/screens/home';
  import {
    dynamicFeeObject,
    addCardView,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';

  import { handleEditContact as handleOneClickCheckoutEditContact } from 'one_click_checkout/sessionInterface';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getTabTitle } from 'i18n';

  import {
    LOGOUT_ACTION,
    LOGOUT_ALL_DEVICES_ACTION,
    EDIT_CONTACT_ACTION,
  } from 'ui/labels/topbar';

  // Utils
  import { getSession } from 'sessionmanager';
  import { getAnimationOptions } from 'svelte-utils';
  import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';

  import { Events, MiscEvents } from 'analytics';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { views } from 'one_click_checkout/routing/constants';
  import { logUserOut } from 'checkoutframe/customer';
  import { EventsV2 } from 'analytics-v2';

  const session = getSession();
  const dispatch = createEventDispatcher();

  export let isFixed = false;

  let shown = false;
  let userDetailsShown = true;
  let logged = false;
  let logoutDropdownShown = false;
  let contact = '';

  let cus;
  let isTitleResize = false;
  let userDropDown = {};

  export function updateUserDropDown() {
    cus = getCustomerDetails();
    userDropDown = {
      edit: {
        label: EDIT_CONTACT_ACTION,
        isVisible: isRedesignV15(),
        onClick: handleOneClickCheckoutEditContact.bind(null, false),
      },
      logout: {
        label: LOGOUT_ACTION,
        isVisible: cus?.logged,
        onClick: handleLogoutClick,
      },
      logoutAllDevices: {
        label: LOGOUT_ALL_DEVICES_ACTION,
        isVisible: cus?.logged,
        onClick: handleLogoutAllDevicesClick,
      },
    };
  }
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

  function setTitleResize(tabTitle) {
    isTitleResize = tabTitle && tabTitle.length > 15;
  }

  function generateOverriddenTitle(tab, locale) {
    const override = titleOverrides[tab];

    if (!override) {
      const tabTitle = getTabTitle(tab, locale);
      setTitleResize(tabTitle);
      return tabTitle;
    }

    if (override.type === 'image') {
      return `<img src=${override.data} alt="">`;
    }
    const tabTitle = getTabTitle(override.data, locale);
    setTitleResize(tabTitle);
    return tabTitle;
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
    updateUserDropDown();
  }

  export function setContact(newContact) {
    contact = newContact;
  }

  function handleBackClick() {
    //For QR Based Feebearer payements, set the amount to the original amount.
    const amount = getAmount();
    session.setAmount(amount);
    $showFeeLabel = true;
    tick().then(() => {
      dynamicFeeObject.set({});
      showFeesIncl.set({});
      addCardView.set('');
    });

    dispatch('back');
  }

  function handleUserDetailsClick() {
    if (logged || (isRedesignV15() && $activeRoute.name !== views.DETAILS)) {
      logoutDropdownShown = !logoutDropdownShown;
    }
  }

  function handleLogoutClick() {
    logUserOut(
      get(contactStore),
      false,
      handleOneClickCheckoutEditContact.bind(null, true)
    );
    const current_screen =
      session.tab === 'home-1cc' ? $activeRoute.name : session.tab || 'methods';
    Events.Track(MiscEvents.LOGOUT_CLICKED, {
      current_screen,
    });
    EventsV2.Reset();
    logoutDropdownShown = false;
  }

  function handleLogoutAllDevicesClick() {
    logUserOut(
      get(contactStore),
      true,
      handleOneClickCheckoutEditContact.bind(null, true)
    );
    const current_screen =
      session.tab === 'home-1cc' ? $activeRoute.name : session.tab || 'methods';
    Events.Track(MiscEvents.LOGOUT_CLICKED, {
      current_screen,
    });
    logoutDropdownShown = false;
  }

  function handleOutsideClick() {
    if (logoutDropdownShown) {
      logoutDropdownShown = false;
    }
  }

  $: {
    if (logoutDropdownShown) {
      document.body.addEventListener('click', handleOutsideClick);
    } else {
      document.body.removeEventListener('click', handleOutsideClick);
    }
  }

  onMount(() => {
    if (isIRCTC()) {
      setOverridesForIrctc();
    }
    updateUserDropDown();
  });
</script>

{#if shown && !isRedesignV15()}
  <div
    class:topbar-sticky={isFixed}
    id="topbar"
    class="theme-secondary-highlight"
    transition:fly={getAnimationOptions({ y: -46, duration: 200 })}
  >
    {#if $isContactPresent && userDetailsShown && $activeRoute.name !== views.DETAILS}
      <div
        id="top-right"
        class:logged
        on:click|stopPropagation={handleUserDetailsClick}
      >
        <div id="user">{contact}</div>
        {#if logoutDropdownShown}
          <div id="profile">
            {#each Object.keys(userDropDown) as key}
              {#if userDropDown[key].isVisible}
                <li on:click|stopPropagation={userDropDown[key].onClick}>
                  {$t(userDropDown[key].label)}
                </li>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
    <div id="top-left" on:click={handleBackClick}>
      <i class="back">&#xe604;</i>
      <div id="tab-title" class:text-small={isTitleResize}>
        {@html generateOverriddenTitle(tab, $locale)}
      </div>
    </div>
  </div>
{/if}

<style>
  #topbar.topbar-sticky {
    position: sticky;
    top: 0;
  }
  #top-left .text-small {
    font-size: 13px;
  }
</style>
