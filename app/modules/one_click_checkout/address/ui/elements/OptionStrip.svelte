<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency, getSingleShippingExpVariant } from 'razorpay';
  import { Events } from 'analytics';
  import ShippingOptionEvents from 'one_click_checkout/shipping_options/analytics';
  import {
    STRIP_FREE_LABEL,
    STRIP_CHARGES_LABEL,
  } from 'one_click_checkout/shipping_options/i18n/labels';
  import { formatTemplateWithLocale } from 'i18n';
  import { FREE_LABEL } from 'summary_modal/i18n/labels';

  // types
  import type { ShippingMethod } from 'one_click_checkout/shipping_options/types/interface';

  export let shippingMethod: ShippingMethod;
  export let classes = '';

  const currency = getCurrency();
  let showStrip = false;

  function getBannerText() {
    if (!shippingMethod) {
      return;
    }

    const { description, shipping_fee } = shippingMethod;

    let trailingText = '';

    if (!description) {
      trailingText = shipping_fee
        ? formatTemplateWithLocale(
            STRIP_CHARGES_LABEL,
            {
              charge: formatAmountWithSymbol(shipping_fee, currency, false),
            },
            $locale
          )
        : $t(STRIP_FREE_LABEL);
    } else {
      trailingText = shipping_fee
        ? formatAmountWithSymbol(shipping_fee, currency, false)
        : $t(FREE_LABEL);
    }

    return `${description ? `${description} | ` : ''}${trailingText}`;
  }

  function stripShown() {
    showStrip =
      !!shippingMethod?.description ||
      getSingleShippingExpVariant() === 'VARIANT_A';

    if (showStrip) {
      Events.TrackRender(ShippingOptionEvents.OPTION_STRIP_SHOWN, {
        shipping_timeline: shippingMethod?.description,
        shipping_amount: shippingMethod?.shipping_fee || 0,
        banner_text: getBannerText(),
      });
    }
  }

  $: shippingMethod, stripShown();
</script>

{#if showStrip}
  <div
    data-testid="shipping-banner"
    class={`single-option ${classes}`}
    in:slide|local={{ duration: 300 }}
  >
    {getBannerText()}
  </div>
{/if}

<style lang="scss">
  .single-option {
    background: rgba(225, 234, 249, 0.7);
    border-radius: 4px;
    padding: 10px 12px;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    color: var(--secondary-text-color);
  }

  .mg-btm {
    margin-bottom: 18px;
  }

  .mg-top {
    margin-top: 8px;
  }
</style>
