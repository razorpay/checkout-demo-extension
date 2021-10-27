<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import TopBar from 'ui/components/Topbar.svelte';
  import Loader from 'one_click_checkout/loader/Loader.svelte';
  import SecuredMessage from 'ui/components/SecuredMessage.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  // Store imports
  import { currentView } from 'one_click_checkout/routing/store';
  import { contact, setContact, setEmail } from 'checkoutstore/screens/home';
  import { getPrefilledContact, getPrefilledEmail } from 'checkoutstore';
  // Constants import
  import { routesConfig } from 'one_click_checkout/routing/config';
  import { views } from 'one_click_checkout/routing/constants';
  // Helpers import
  import { screensHistory } from 'one_click_checkout/routing/History';
  import { determineLandingView } from 'one_click_checkout/helper';
  import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
  // svelte imports
  import { onMount, tick, afterUpdate } from 'svelte';
  import { getTheme } from 'one_click_checkout/address/sessionInterface';

  let topbar;
  let Component;
  let isBackEnabled;
  let props;
  let handleBack;

  setContact(getPrefilledContact());
  setEmail(getPrefilledEmail());

  let theme = getTheme();
  let styles = {
    'highlight-color': theme.highlightColor,
    'sec-highlight-color': theme.secondaryHighlightColor,
    'background-color': theme.backgroundColor,
  };

  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(';');

  onMount(() => {
    new Loader({
      target: discreet._Doc.querySelector('#one-cc-loader'),
    });
    const view = determineLandingView();
    if (screensHistory.isInitilized) {
      screensHistory.push(view);
    } else {
      screensHistory.initialize(view);
    }
    contact.subscribe(updateTopBar);
  });

  function updateTopBar() {
    if (!topbar) return;
    if (!isBackEnabled) {
      topbar.hide();
    } else {
      const title = routesConfig[$currentView]?.tabTitle || $currentView;
      topbar.setTab(title);
      topbar && topbar.setContact(getCustomerDetails().contact);
      topbar.setLogged(true);
      topbar.show();
      topbar.updateUserDropDown();
    }
  }

  $: {
    Component = routesConfig[$currentView]?.component;
    props = routesConfig[$currentView]?.props;
    isBackEnabled = routesConfig[$currentView]?.isBackEnabled;
    handleBack = routesConfig[$currentView]?.props?.handleBack;
  }
  $: {
    tick().then(() => {
      if (topbar && topbar.setTab) {
        if (typeof isBackEnabled === 'function') {
          isBackEnabled = isBackEnabled();
        }
      }
    });
  }

  afterUpdate(updateTopBar);

  function onBack() {
    if (handleBack) {
      handleBack();
    }
    screensHistory.pop();
  }
</script>

<Tab
  method="home-1cc"
  overrideMethodCheck={true}
  shown={true}
  pad={false}
  resetMargin="true"
>
  {#if $currentView !== ''}
    <TopBar bind:this={topbar} on:back={onBack} isFixed={true} />
    <div style={cssVarStyles} class="container">
      <svelte:component this={Component} {...props} />
    </div>
    {#if $currentView === views.COUPONS || $currentView === views.DETAILS}
      <Bottom tab="home-1cc">
        <SecuredMessage />
      </Bottom>
    {/if}
  {/if}
</Tab>

<style>
  :global(#form-home-1cc) {
    height: inherit;
    overflow: hidden;
  }

  .container {
    height: inherit;
  }
</style>
