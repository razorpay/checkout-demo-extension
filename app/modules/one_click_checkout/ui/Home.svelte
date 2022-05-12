<script>
  // svelte imports
  import { onMount, tick, afterUpdate, onDestroy } from 'svelte';

  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Loader from 'one_click_checkout/loader/Loader.svelte';
  import SecuredMessage from 'ui/components/SecuredMessage.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import Router from 'one_click_checkout/routing/component/Router.svelte';

  // Store imports
  import { resetRouting, activeRoute } from 'one_click_checkout/routing/store';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { contact, setContact, setEmail } from 'checkoutstore/screens/home';
  import { getPrefilledContact, getPrefilledEmail } from 'razorpay';
  import { savedAddresses } from 'one_click_checkout/address/store';

  // Constants import
  import routes from 'one_click_checkout/routing/routes';
  import { views } from 'one_click_checkout/routing/constants';

  // Helpers import
  import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
  import { destroyHeader } from 'one_click_checkout/header';
  import { destroyTopbar } from 'one_click_checkout/topbar';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';

  // svelte imports
  import { getTheme } from 'one_click_checkout/address/sessionInterface';
  import { redirectToMethods } from 'one_click_checkout/sessionInterface';

  // analytics imports
  import Analytics, { Events } from 'analytics';
  import {
    merchantAnalytics,
    merchantFBStandardAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import { querySelector } from 'utils/doc';

  let topbar;
  let isBackEnabled;
  let handleBack;

  setContact(getPrefilledContact());
  setEmail(getPrefilledEmail());

  let theme = getTheme();

  let styles = {
    'highlight-color': theme.highlightColor,
    'sec-highlight-color': theme.secondaryHighlightColor,
    'background-color': theme.backgroundColor,
    'error-validation-color': '#B21528',
  };

  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(';');

  onMount(() => {
    Events.TrackRender(CouponEvents.SUMMARY_SCREEN_INITIATED);
    Analytics.setMeta('initial_loggedIn', isUserLoggedIn());
    Analytics.setMeta('initial_hasSavedAddress', !!$savedAddresses?.length);

    merchantAnalytics({
      event: ACTIONS.MAGIC_CHECKOUT_REQUESTED,
      category: CATEGORIES.MAGIC_CHECKOUT,
    });
    merchantFBStandardAnalytics({
      event: ACTIONS.INITIATECHECKOUT,
    });
    new Loader({
      target: querySelector('#one-cc-loader'),
    });
    const checkoutTopbar = document.querySelector('#topbar-wrap');
    if (checkoutTopbar) {
      checkoutTopbar.classList.add('hide-topbar');
    }
    const view = views.COUPONS;
    navigator.navigateTo({ path: view });
    contact.subscribe(updateTopBar);
  });

  function updateTopBar() {
    if (!topbar) {
      return;
    }
    if (!isBackEnabled) {
      topbar.hide();
    } else {
      const title =
        navigator.currentActiveRoute?.tabTitle ||
        navigator.currentActiveRoute?.name;
      topbar.setTab(title);
      topbar && topbar.setContact(getCustomerDetails().contact);
      topbar.setLogged(true);
      topbar.show();
      topbar.updateUserDropDown();
    }
  }

  $: {
    isBackEnabled = $activeRoute?.isBackEnabled;
    handleBack = $activeRoute?.props?.handleBack;
  }
  $: {
    tick().then(() => {
      if (topbar && topbar.setTab) {
        if (typeof isBackEnabled === 'function') {
          isBackEnabled = isBackEnabled();
        }
      }
      updateTopBar();
    });
  }

  afterUpdate(updateTopBar);

  function onBack() {
    if (handleBack) {
      handleBack();
    }
    navigator.navigateBack();
    if (navigator.currentActiveRoute.name === views.METHODS) {
      /* During on tab switch the destroy method on replaceNode function acts as async and showing CTA
       * even after switching tab to avoid this we added setTimeout to hide the CTA  */
      setTimeout(function () {
        redirectToMethods();
      }, 0);
    }
  }

  onDestroy(() => {
    resetRouting();
    destroyHeader();
    destroyTopbar();
  });
</script>

<Tab
  method="home-1cc"
  overrideMethodCheck={true}
  shown={true}
  pad={false}
  resetMargin="true"
>
  <div style={cssVarStyles} class="container">
    <Router {routes} />
  </div>
  {#if $activeRoute.name === views.COUPONS || $activeRoute.name === views.DETAILS}
    <Bottom tab="home-1cc">
      <SecuredMessage />
    </Bottom>
  {/if}
</Tab>

<style>
  :global(#form-home-1cc) {
    height: inherit;
    overflow: hidden;
  }

  .container {
    height: inherit;
    overflow: auto;
  }
</style>
