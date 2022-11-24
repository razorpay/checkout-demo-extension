<script lang="ts">
  // svelte imports
  import { onMount, tick, afterUpdate, onDestroy } from 'svelte';

  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import SecuredMessage from 'ui/components/SecuredMessage.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import Router from 'one_click_checkout/routing/component/Router.svelte';

  // Store imports
  import { resetRouting, activeRoute } from 'one_click_checkout/routing/store';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { contact } from 'checkoutstore/screens/home';
  import { getMerchantOrder, getOption } from 'razorpay';
  import { savedAddresses } from 'one_click_checkout/address/store';

  // Constants import
  import routes from 'one_click_checkout/routing/routes';
  import { views } from 'one_click_checkout/routing/constants';

  // Helpers import
  import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
  import { destroyHeader } from 'one_click_checkout/header';
  import { onScrollToggleHeader } from 'one_click_checkout/header/helper';
  import { destroyTopbar } from 'one_click_checkout/topbar';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';

  // session imports
  import { setLineItems } from 'one_click_checkout/cart/sessionInterface';

  // analytics imports
  import Analytics, { Events } from 'analytics';
  import {
    merchantAnalytics,
    merchantFBStandardAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
    MAGIC_FUNNEL,
  } from 'one_click_checkout/merchant-analytics/constant';
  import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';
  import { syncPreferences } from 'one_click_checkout/order/controller';

  let topbar;
  let isBackEnabled;
  let handleBack;
  let contentRef: HTMLDivElement;

  onMount(() => {
    syncPreferences();
    setLineItems(
      getOption('cart')?.line_items || getMerchantOrder().line_items
    );
    Analytics.setMeta(
      OneClickCheckoutMetaProperties.INITIAL_LOGGED_IN,
      isUserLoggedIn()
    );
    Analytics.setMeta(
      OneClickCheckoutMetaProperties.INITIAL_HAS_SAVED_ADDRESS,
      !!$savedAddresses?.length
    );
    Events.TrackRender(CouponEvents.SUMMARY_SCREEN_INITIATED);
    merchantAnalytics({
      event: ACTIONS.MAGIC_CHECKOUT_REQUESTED,
      category: CATEGORIES.MAGIC_CHECKOUT,
    });
    merchantFBStandardAnalytics({
      event: ACTIONS.INITIATECHECKOUT,
    });
    emitMagicFunnelEvent(MAGIC_FUNNEL.CHECKOUT_RENDERED);
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

  function onScroll() {
    if (!contentRef) {
      return;
    }

    onScrollToggleHeader(contentRef);
  }

  afterUpdate(updateTopBar);

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
  <div class="container" on:scroll={onScroll} bind:this={contentRef}>
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
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-body);
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  .container::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
</style>
