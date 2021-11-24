<script>
  // Svelte importrs
  import { createEventDispatcher } from 'svelte';

  // Store
  import { t, locale } from 'svelte-i18n';
  import { codReason } from 'one_click_checkout/address/shipping_address/store';
  import { isCodAvailable } from 'one_click_checkout/address/derived';

  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import CodIcon from 'ui/elements/CodIcon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    getMethodNameForPaymentOption,
    getMethodDescription,
  } from 'checkoutframe/paymentmethods';
  import Analytics, { Events, HomeEvents } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { formatMessageWithLocale, formatTemplateWithLocale } from 'i18n';

  // Store imports
  import {
    COD_DISABLED_LABEL,
    COD_CHARGES_DESCRIPTION,
  } from 'one_click_checkout/address/i18n/labels';
  import { codChargeAmount } from 'one_click_checkout/charges/store';

  import { onMount } from 'svelte';

  // Props
  export let method = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.
  export let instrument = null;
  export let error = '';
  export let disabled = false;
  export let errorLabel = '';

  const session = getSession();
  const dispatch = createEventDispatcher();

  const icons = session.themeMeta.icons;
  let _icon = getIconForDisplay();

  let _subtitle;
  $: {
    _subtitle = getSubtitleForDisplay($locale);
    if (method === 'cod' && disabled) {
      _subtitle = '';
    }
  }

  let _title;
  $: _title = getTitleForDisplay($locale);

  function getSubtitleForDisplay(locale) {
    if (subtitle) {
      return subtitle;
    } else if (method === 'cod' && $codChargeAmount) {
      return `
        <div class="highlight-text">
          ${formatTemplateWithLocale(
            COD_CHARGES_DESCRIPTION,
            { charge: session.formatAmountWithCurrency($codChargeAmount) },
            locale
          )}
        </div>
      `;
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

  onMount(() => {
    if (method === 'cod') {
      isCodAvailable.subscribe((available) => {
        disabled = !available;
        errorLabel = COD_DISABLED_LABEL;
        error = $codReason;
      });
    }
  });

  function select() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method,
      },
    });

    if (method === 'cod') {
      Events.TrackBehav(HomeEvents.COD_METHOD_SELECTED);
    }

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
  className="new-method has-tooltip"
  defaultStyles={false}
  on:click={select}
  attributes={{ method }}
  {disabled}
>
  <i slot="icon">
    {#if method === 'cod'}
      <CodIcon {disabled} />
    {:else}
      <Icon icon={_icon} />
    {/if}
  </i>
  <div slot="title" class:cod-error={disabled}>{_title}</div>
  <div slot="subtitle">{@html _subtitle}</div>
  <div slot="error">
    {#if disabled}
      <div class="error">
        <div class="error-container">
          <span class="error-label">{$t(errorLabel)}</span>
          <!-- TODO: Fix the tooltip and add the error-icon again
            <div class="error-icon">
            <InfoIcon variant="red" />
            <Tooltip className="" bindTo="#form-common" align={['bottom']}>
              {error}
            </Tooltip>
          </div> -->
        </div>
      </div>
    {/if}
  </div>
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

  .error {
    margin-top: 4px;
    color: #ee1a32 !important;
    overflow: visible;
  }
  .error-container {
    display: flex;
    align-items: center;
  }
  .error-label {
    margin-right: 4px;
  }
  .error-icon {
    display: inline-flex;
  }

  .cod-error {
    color: #858585 !important;
  }
</style>
