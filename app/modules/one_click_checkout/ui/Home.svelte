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
  import { cartItems } from 'one_click_checkout/cart/store';
  import { cartAmount } from 'one_click_checkout/charges/store';
  import { showTruecallerErrorMessage } from 'one_click_checkout/store';

  // Constants import
  import {
    ERRORS,
    MAX_TIME_TO_ENABLE_TRUECALLER_AUTO_TRIGGER,
  } from 'truecaller';
  import routes from 'one_click_checkout/routing/routes';
  import { views } from 'one_click_checkout/routing/constants';

  // Helpers import
  import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
  import { destroyHeader } from 'one_click_checkout/header';
  import { onScrollToggleHeader } from 'one_click_checkout/header/helper';
  import { destroyTopbar } from 'one_click_checkout/topbar';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { initTruecaller } from 'one_click_checkout/controller';

  // session imports
  import { setLineItems } from 'one_click_checkout/cart/sessionInterface';

  // analytics imports
  import Analytics, { Events } from 'analytics';
  import {
    generateInitialMoengagePayload,
    merchantAnalytics,
    merchantFBStandardAnalytics,
    moengageAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
    MAGIC_FUNNEL,
    MOENGAGE_EVENTS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';
  import {
    moengageEventsData,
    updateMoengageEventsData,
  } from 'one_click_checkout/merchant-analytics/store';
  import { appliedCoupon } from 'one_click_checkout/coupons/store';
  import { AnalyticsV2State } from 'analytics-v2';
  import { EVENTS as TRUECALLER_EVENTS } from 'truecaller/analytics/events';

  let topbar;
  let isBackEnabled;
  let handleBack;
  let contentRef: HTMLDivElement;

  onMount(() => {
    setLineItems(
      getOption('cart')?.line_items || getMerchantOrder().line_items
    );

    const timeTakenToMount = Math.abs(
      Date.now() - AnalyticsV2State.checkoutInvokedTime
    );

    showTruecallerErrorMessage.set(false);
    if (timeTakenToMount < MAX_TIME_TO_ENABLE_TRUECALLER_AUTO_TRIGGER) {
      Events.TrackIntegration(
        TRUECALLER_EVENTS.TRUE_CALLER_AUTO_TRIGGER_INVOKED,
        { timeTakenToMount, success: true }
      );

      initTruecaller().catch((e) => {
        const code = e.code || '';
        if (
          ![
            ERRORS.TRUECALLER_NOT_FOUND,
            ERRORS.TRUECALLER_LOGIN_DISABLED,
          ].includes(code)
        ) {
          showTruecallerErrorMessage.set(true);
        }
      });
    } else {
      Events.TrackIntegration(
        TRUECALLER_EVENTS.TRUE_CALLER_AUTO_TRIGGER_INVOKED,
        { timeTakenToMount, success: false }
      );
    }

    Analytics.setMeta(
      OneClickCheckoutMetaProperties.INITIAL_LOGGED_IN,
      isUserLoggedIn()
    );
    Analytics.setMeta(
      OneClickCheckoutMetaProperties.INITIAL_HAS_SAVED_ADDRESS,
      !!$savedAddresses?.length
    );
    Events.TrackRender(CouponEvents.SUMMARY_SCREEN_INITIATED);

    const data = generateInitialMoengagePayload($cartItems);

    updateMoengageEventsData({
      ...data,
      'Cart Total Price': $cartAmount / 100,
      'Promo Code': $appliedCoupon,
    });

    merchantAnalytics({
      event: ACTIONS.MAGIC_CHECKOUT_REQUESTED,
      category: CATEGORIES.MAGIC_CHECKOUT,
    });
    merchantFBStandardAnalytics({
      event: ACTIONS.INITIATECHECKOUT,
    });
    moengageAnalytics({
      eventName: MOENGAGE_EVENTS.CHECKOUT_INITIATED,
      eventData: $moengageEventsData,
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
    background-color: var(--background-color-magic);
  }
  .container::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
</style>
