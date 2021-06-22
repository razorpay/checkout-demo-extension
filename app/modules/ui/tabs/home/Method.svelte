<script>
  // Svelte importrs
  import { createEventDispatcher } from 'svelte';

  // Props
  export let method = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.
  export let instrument = null;

  // Store
  import { locale } from 'svelte-i18n';

  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    getMethodNameForPaymentOption,
    getMethodDescription,
  } from 'checkoutframe/paymentmethods';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { formatMessageWithLocale } from 'i18n';
  import { getThemeColor } from 'checkoutstore/theme';

  const session = getSession();
  const dispatch = createEventDispatcher();

  const icons = session.themeMeta.icons;
  const _icon = getIconForDisplay();

  let _subtitle;
  $: _subtitle = getSubtitleForDisplay($locale);

  let _title;
  $: _title = getTitleForDisplay($locale);

  function getSubtitleForDisplay(locale) {
    if (subtitle) {
      return subtitle;
    } else {
      return getMethodDescription(method, locale);
    }
  }

  function getTitleForDisplay(locale) {
    return title || getMethodNameForPaymentOption(method, locale);
  }

  function getIconForDisplay() {
    if (icon) {
      return icon;
    } else {
      if (/card$/.test(method)) {
        return icons['card'];
      } else {
        return icons[method];
      }
    }
  }

  function select() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method,
      },
    });

    dispatch('select');
  }

  // disabled for phase 1 of Walnut369
  // let showWalnutBanner = false;
  // $: showWalnutBanner = instrument.showWalnutBanner;
  let walnutBannerText = '';
  $: walnutBannerText = formatMessageWithLocale(
    'cardless_emi.walnut_banner_text',
    $locale
  );
</script>

<SlottedOption
  className="new-method"
  defaultStyles={false}
  on:click={select}
  attributes={{ method }}
>
  <i slot="icon">
    <Icon icon={_icon} />
  </i>
  <div slot="title">{_title}</div>
  <div slot="subtitle">{_subtitle}</div>
  <!-- <div slot="banner">
    {#if showWalnutBanner}
      <div
        class="banner"
        style={`background:${getThemeColor()}1a; color:${getThemeColor()}`}
      >
        <img
          class="banner-img"
          src={'https://cdn.razorpay.com/cardless_emi/walnut369.svg'}
          alt=""
        />
        <span>{walnutBannerText}</span>
        <Icon icon={icons.new_window} />
      </div>
    {/if}
  </div> -->
</SlottedOption>

<style>
  /* Container styles */
  :global(.new-method) {
    padding: 16px;
  }

  .banner-img {
    height: 10px;
    margin-right: 10px;
  }

  .banner {
    position: relative;
    top: 16px;
    height: 26px;
    left: -16px;
    background: rgba(58, 151, 252, 0.1);
    width: calc(100% + 32px);
    display: flex;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
    font-size: 10px;
    line-height: 12px;
  }

  .banner span {
    margin-right: 4px;
  }

  /* Icon styles */
  i {
    display: flex;
    margin-right: 16px;
    width: 24px;
    min-width: 24px;
    text-align: center;
  }

  i :global(.gpay-icon) {
    margin-left: 0;
    flex: 1 1 0;
  }

  i :global(svg) {
    height: 24px;
    flex: 1 1 0;
    width: auto;
  }

  /* Content styles */
  div[slot='title'] {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.1rem;
    color: #4f4f4f;
    text-transform: none;
  }

  div[slot='subtitle'] {
    margin: 4px 0 0 0;
    line-height: 1rem;
    color: #828282;
  }
</style>
