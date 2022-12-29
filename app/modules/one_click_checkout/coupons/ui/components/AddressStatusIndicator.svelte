<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';
  import { afterUpdate, onDestroy } from 'svelte/internal';
  import { slide } from 'svelte/transition';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    ADDRESS_WIDGET_LOADER_TEXT,
    ADDRESS_WIDGET_SERVICEABLE_TEXT,
    ADDRESS_WIDGET_UNSERVICEABLE_TEXT,
  } from 'one_click_checkout/coupons/i18n/labels';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import WithEllipsis from 'one_click_checkout/common/ui/WithEllipsis.svelte';
  import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';

  export let loading = false;
  export let serviceable = false;
  let timer: number;

  let initialServiceability = false;
  let showServiceableMessage = false;
  let done = false;

  afterUpdate(() => {
    if (!done) {
      showServiceableMessage = serviceable && !initialServiceability;
    }
  });

  $: {
    if (showServiceableMessage) {
      timer = window.setTimeout(() => {
        done = true;
        showServiceableMessage = false;
      }, 4000);
    }
  }

  onMount(() => {
    initialServiceability = serviceable;
  });

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

{#if loading}
  <div class="mt-8" data-testid="address-widget-loader">
    <WithEllipsis>
      <span id="loader-text">
        {$t(ADDRESS_WIDGET_LOADER_TEXT)}
      </span>
    </WithEllipsis>
  </div>
{:else if showServiceableMessage}
  <div
    id="address-serviceable-message"
    data-testid="address-serviceable-message"
    class="mt-8"
    out:slide|local={{ duration: 500 }}
  >
    <span id="address-serviceable-text">
      {$t(ADDRESS_WIDGET_SERVICEABLE_TEXT)}
    </span>
    <Icon icon={circle_check(undefined, undefined, '16', '14')} />
  </div>
{:else if !serviceable}
  <div
    data-test-id="address-box-unserviceability"
    id="address-serviceability-error"
    class="mt-8"
    in:slide|local={{ duration: 300 }}
  >
    {$t(ADDRESS_WIDGET_UNSERVICEABLE_TEXT)}
  </div>
{/if}

<style>
  #address-serviceable-text {
    font-family: 'Inter';
    font-style: normal;
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-small);
    line-height: 150%;
    color: var(--tertiary-text-color);
  }

  #address-serviceable-message {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  #address-serviceability-error {
    font-size: 11px;
    line-height: 150%;
    color: var(--error-validation-color);
    background: #fff1f1;
    border-radius: 1px;
    padding: 6px 8px;
    opacity: 1;
    font-weight: var(--font-weight-medium);
  }

  .mt-8 {
    margin-top: 8px;
  }

  #loader-text {
    font-family: 'Inter';
    font-style: italic;
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-small);
    line-height: 150%;
    color: var(--tertiary-text-color);
  }
</style>
