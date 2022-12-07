<script lang="ts">
  // svelte imports
  import { onDestroy, onMount, tick } from 'svelte';
  import { get, Readable } from 'svelte/store';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_up from 'account_modal/icons/arrow_up';
  import Loader from 'account_modal/ui/Loader.svelte';
  import close from 'one_click_checkout/coupons/icons/close';

  // utils Imports
  import { handleEditContact } from 'one_click_checkout/sessionInterface';
  import { getSession } from 'sessionmanager';
  import Razorpay from 'common/Razorpay';

  // store imports
  import { shouldUseVernacular, filterVernacular } from 'checkoutstore/methods';
  import { contact as contactStore } from 'checkoutstore/screens/home';
  import { constantCSSVars } from 'common/constants';

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
    TERMS_OF_USE,
    PRIVACY_POLICY,
  } from 'account_modal/i18n/labels';
  import { logUserOut } from 'checkoutframe/customer';

  // helper imports
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  // analytics imports
  import { Events } from 'analytics';
  import { ACCOUNT_VARIANT } from 'account_modal/constants';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import AccountEvents from 'account_modal/analytics';
  import { popStack, pushOverlay } from 'navstack';
  import {
    getPreferences,
    isContactEmailHidden,
    isOneClickCheckout,
    isRedesignV15,
  } from 'razorpay';
  import Details from 'one_click_checkout/coupons/ui/components/Details.svelte';
  import type { ValueOf } from 'types/utils';

  export let options: { variant: ValueOf<typeof ACCOUNT_VARIANT> };
  let isLoggedIn: boolean;
  let showLanguageList: boolean;

  let currentLocaleLanguage: string;
  $: currentLocaleLanguage = getLocaleName($locale as string);

  const localesList: typeof $locales = filterVernacular($locales);

  let variant: ValueOf<typeof ACCOUNT_VARIANT> | undefined =
    ACCOUNT_VARIANT.DEFAULT;

  const showChangeLanguage = shouldUseVernacular();
  const session = getSession();
  let screen_name: ReturnType<typeof getCurrentScreen>;
  const privacy = getPreferences('privacy') || {};
  const terms = getPreferences('terms') || {};

  onDestroy(() => {
    Events.TrackBehav(AccountEvents.SCREEN_DISMISSED, { screen_name });
  });

  function handleLogoutClick() {
    Events.TrackBehav(AccountEvents.LOGOUT_CLICKED, { screen_name });
    logUserOut(get(contactStore), false, handleEditContact.bind(null, true));
    hideMethods();
    popStack();
  }

  onMount(() => {
    screen_name = getCurrentScreen();
    const { variant: variantType } = options || {};
    variant = variantType;
    isLoggedIn = isUserLoggedIn();
    showLanguageList = false;
  });

  function hideMethods() {
    if (
      !isOneClickCheckout() &&
      !isRedesignV15() &&
      session?.homeTab?.canGoBack()
    ) {
      session.homeTab?.hideMethods();
    }
  }

  function handleLogoutAllDevicesClick() {
    Events.TrackBehav(AccountEvents.LOGOUT_ALL_DEVICES_CLICKED, {
      screen_name,
    });
    logUserOut(get(contactStore), true, handleEditContact.bind(null, true));
    hideMethods();
    popStack();
  }

  function handleChangeLanguage() {
    showLanguageList = true;
    Events.TrackBehav(AccountEvents.CHANGE_LANGUAGE, {
      current_language: currentLocaleLanguage,
    });
  }

  function selectLanguage(code: string) {
    if (variant === ACCOUNT_VARIANT.LANGUAGE_ONLY) {
      Events.TrackBehav(CouponEvents.SUMMARY_LANGUAGE_CHANGED, {
        new_language_selected: code,
      });
    }
    Events.TrackBehav(AccountEvents.LANGUAGE_CLICKED, { screen_name });

    // In order to insure the bottom sheet get closes...when different language is chosen
    if ($locale !== code) {
      popStack();
    }
    $locale = code;
    showLanguageList = false;
  }

  function handleBack() {
    showLanguageList = false;
  }

  function handleEdit() {
    Events.TrackBehav(AccountEvents.EDIT_PERSONAL_DETAILS_CLICKED, {
      screen_name,
    });

    if (isOneClickCheckout()) {
      handleEditContact(false);
      popStack();
    } else {
      popStack();
      tick().then(() => {
        pushOverlay({
          component: Details,
          props: {
            fullScreen: true,
          },
        });
      });

      Razorpay.sendMessage({
        event: 'event',
        data: {
          event: 'user_details.edit',
        },
      });
      hideMethods();
    }
  }
</script>

<div
  class="account-container"
  class:only-language={variant === ACCOUNT_VARIANT.LANGUAGE_ONLY}
  class:single-language={localesList.length === 1}
>
  {#if variant === ACCOUNT_VARIANT.LANGUAGE_ONLY}
    <div class="account-heading-container">
      <p class="account-heading">
        {$t(CHANGE_LANGUAGE)}
      </p>
      <button class="account-toggle-icon" on:click={() => popStack()}>
        <Icon icon={close(constantCSSVars['primary-text-color'])} />
      </button>
    </div>
    <hr />
    <ul class="language-container">
      {#each localesList as locale}
        <li class="list-item">
          <button
            class="account-menu"
            data-test-id="lang-{getLocaleName(locale)}"
            on:click={() => selectLanguage(locale)}
          >
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
      <button class="account-toggle-icon" on:click={() => popStack()}>
        <Icon icon={close(constantCSSVars['primary-text-color'])} />
      </button>
    </div>
    <hr />
    {#if showLanguageList}
      <button class="back-btn-container" on:click={handleBack}>
        <span class="back-btn-icon">
          <Icon icon={arrow_up(10, 6, constantCSSVars['primary-text-color'])} />
        </span>
        <span class="back-btn-text">{$t(BACK)}</span>
      </button>
      <ul class="language-container">
        {#each localesList as locale}
          <li class="list-item">
            <button
              class="account-menu"
              data-test-id="lang-{getLocaleName(locale)}"
              on:click={() => selectLanguage(locale)}
            >
              {getLocaleName(locale)}
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      {#if (isLoggedIn && isOneClickCheckout()) || (!isOneClickCheckout() && !isContactEmailHidden())}
        <p
          data-test-id="edit-contact-account"
          class="account-menu"
          on:click={handleEdit}
        >
          {$t(EDIT_CONTACT_ACTION)}
        </p>
      {/if}
      {#if privacy.url || terms.url}
        <hr class="border-light-gray" />
        {#if terms.url}
          <a class="account-menu" href={terms.url} target="_blank">
            {terms.display_name || $t(TERMS_OF_USE)}
          </a>
        {/if}
        {#if privacy.url}
          <a class="account-menu" href={privacy.url} target="_blank">
            {privacy.display_name || $t(PRIVACY_POLICY)}
          </a>
        {/if}
        <hr class="border-light-gray" />
      {/if}
      {#if showChangeLanguage}
        <p
          data-test-id="account-lang-cta"
          class="account-menu"
          on:click={handleChangeLanguage}
        >
          {$t(CHANGE_LANGUAGE)}: {currentLocaleLanguage}
          <span class="language-btn">
            <Icon
              icon={arrow_up(10, 6, constantCSSVars['primary-text-color'])}
            />
          </span>
        </p>
      {/if}
      {#if isLoggedIn}
        <hr class="account-separator" />
        <p
          data-test-id="account-logout-cta"
          class="account-menu"
          on:click={handleLogoutClick}
        >
          {$t(LOGOUT_ACTION)}
        </p>
        <p
          data-test-id="account-logoutall-cta"
          class="account-menu"
          on:click={handleLogoutAllDevicesClick}
        >
          {$t(LOGOUT_ALL_DEVICES_ACTION)}
        </p>
      {/if}
    {/if}
  {/if}
  <Loader />
</div>

<style lang="scss">
  .account-container {
    text-align: left;
    padding: 16px 0px;
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
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
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
    border: 1px solid var(--light-dark-color);
    border-bottom: none;
    margin: 12px 16px;
  }

  .border-light-gray {
    border-color: #f6f6f6;
  }
  .language-container {
    overflow-y: scroll;
    max-height: 140px;
    list-style: none;
    padding-inline-start: 0px;
    margin: 0px;
  }
  .back-btn-container {
    color: var(--tertiary-text-color);
    font-size: var(--font-size-small);
    padding: 0px 24px 12px;
    display: flex;
    align-items: center;
  }
  .account-toggle-icon {
    height: 14px;
    transform: rotate(180deg);
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .back-btn-text {
    padding-left: 10px;
    padding-bottom: 2px;
    cursor: pointer;
  }
  .back-btn-icon {
    transform: rotate(270deg);
    cursor: pointer;
  }
  .language-btn {
    transform: rotate(90deg);
    cursor: pointer;
  }
  :global(.mobile) .account-container {
    bottom: 0;
  }
  .language-selection {
    color: var(--tertiary-text-color);
    font-size: var(--font-size-small);
    font-weight: 300;
    padding-left: 10px;
  }

  .list-item .account-menu {
    width: 100%;
    border-radius: 0px;
    color: var(--primary-text-color);
    font-size: var(--font-size-body);
  }

  .only-language {
    height: 320px;

    .language-container {
      max-height: 250px;
    }
  }

  .single-language {
    height: auto;

    .language-container {
      max-height: 250px;
    }
  }
</style>
