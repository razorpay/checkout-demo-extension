<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';

  // UI imports
  import ShippingRadioItem from 'one_click_checkout/shipping_options/ui/Item.svelte';
  import Stack from 'ui/layouts/Stack.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // store imports
  import { selectedShippingOption } from 'one_click_checkout/address/shipping_address/store';
  import {
    shippingCharge,
    codChargeAmount,
    isShippingAddedToAmount,
    resetCharges,
  } from 'one_click_checkout/charges/store';

  // helper imports
  import { popStack } from 'navstack';
  import { Events } from 'analytics';
  import ShippingOptionEvents from 'one_click_checkout/shipping_options/analytics';
  import {
    getSelectedOptionIndex,
    isOptionIdValid,
  } from 'one_click_checkout/shipping_options/helpers';

  // constant imports
  import {
    OVERLAY_MAX_HEIGHT,
    DEFAULT_SHIPPING_OPTIONS_VISIBLE,
  } from 'one_click_checkout/shipping_options/constants';
  import { constantCSSVars } from 'common/constants';
  import {
    HEADER_LABEL,
    OVERLAY_CTA_LABEL,
  } from 'one_click_checkout/shipping_options/i18n/labels';

  export let options = [];
  export let isOverlay = false;
  export let onContinue = null;
  export let expanded = false;

  let listElem: HTMLElement;
  let selectedShippingOptionId = $selectedShippingOption?.id;
  let showShadow = false;
  let optionsToShow = [];
  let selectedIdx = 0;
  let defaultSelected = false;

  $: {
    if (isOverlay || expanded) {
      optionsToShow = options;
    } else {
      optionsToShow = options.slice(0, DEFAULT_SHIPPING_OPTIONS_VISIBLE);
    }
  }

  onMount(() => {
    if (isOverlay && listElem) {
      const scrollHeight =
        getComputedStyle(listElem).getPropertyValue('height');

      // removing 'px' from string
      const scrollHeightVal = +scrollHeight.slice(0, -2);
      showShadow = scrollHeightVal > OVERLAY_MAX_HEIGHT;

      Events.TrackRender(ShippingOptionEvents.OVERLAY_SHOWN);
    }

    if (
      (selectedShippingOptionId &&
        !isOptionIdValid(selectedShippingOptionId, options)) ||
      !selectedShippingOptionId
    ) {
      // options are sorted as soon as provided in response
      selectedShippingOptionId = options[0]?.id;
      defaultSelected = true;
    }

    selectedIdx = getSelectedOptionIndex(selectedShippingOptionId, options);

    if (selectedIdx >= DEFAULT_SHIPPING_OPTIONS_VISIBLE) {
      expanded = true;
    }
  });

  $: {
    if (selectedShippingOptionId) {
      $selectedShippingOption = options?.find(
        (option) => option.id === selectedShippingOptionId
      );
      if ($selectedShippingOption) {
        $shippingCharge = $selectedShippingOption.shipping_fee || 0;
        $codChargeAmount = $selectedShippingOption.cod_fee || 0;
        $isShippingAddedToAmount = true;
      }

      if (defaultSelected) {
        Events.TrackBehav(ShippingOptionEvents.OPTION_SELECTED, {
          shipping_title: options[0]?.name,
          shipping_timeline: options[0]?.description,
          shipping_amount: options[0]?.shipping_fee || 0,
          type_of_selection: 'preselected',
        });
        defaultSelected = false;
      } else {
        Events.TrackBehav(ShippingOptionEvents.OPTION_SELECTED, {
          shipping_title: $selectedShippingOption?.name,
          shipping_timeline: $selectedShippingOption?.description,
          shipping_amount: $selectedShippingOption?.shipping_fee || 0,
          type_of_selection: 'custom',
        });
      }
    }
  }

  export function preventBack() {
    return true;
  }

  function handleClose() {
    popStack();
    resetCharges();
    selectedShippingOptionId = '';
  }

  function handleContinueClick() {
    if (!selectedShippingOptionId) {
      return;
    }

    onContinue && typeof onContinue === 'function' && onContinue();
    popStack();
  }
</script>

<div class:shipping-overlay={isOverlay}>
  {#if isOverlay}
    <div class="header" class:show-shadow={showShadow}>
      <div class="title">
        {$t(HEADER_LABEL)}
      </div>
      <div class="close-btn" on:click={handleClose}>
        <Icon icon={close(20, 20, constantCSSVars['secondary-text-color'])} />
      </div>
    </div>
  {/if}
  <div
    class="shipping-list"
    class:scrollable={showShadow}
    style="--max-height:{OVERLAY_MAX_HEIGHT}px"
  >
    <div bind:this={listElem}>
      <Stack vertical>
        {#each optionsToShow as option (option.id)}
          <ShippingRadioItem
            {option}
            checked={option.id === selectedShippingOptionId}
            bind:group={selectedShippingOptionId}
            fullWidth={isOverlay}
          />
        {/each}
      </Stack>
    </div>
  </div>
  <!--CTA-->
  {#if isOverlay}
    <div class="shipping-cta-container">
      <button class="btn" on:click={handleContinueClick}
        >{$t(OVERLAY_CTA_LABEL)}</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  .shipping-overlay {
    .shipping-list {
      padding: 16px;
    }
  }
  .show-shadow {
    box-shadow: 0px 7px 10px 0px rgba(107, 108, 109, 0.15);
  }
  .title {
    text-align: start;
    font-weight: var(--font-weight-semibold);
  }
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--light-dark-color);
  }
  .shipping-list {
    text-align: start;

    &.scrollable {
      overflow: auto;
      max-height: var(--max-height);
    }
  }
  .shipping-cta-container {
    padding: 10px 16px;
    box-shadow: 0px -4px 8px rgba(107, 108, 109, 0.15);

    .btn {
      width: 100%;
      border-radius: 6px;
    }
  }
  :global(.shipping-radio):not(:last-child) {
    margin-bottom: 20px;
  }
  .close-btn {
    cursor: pointer;
  }
</style>
