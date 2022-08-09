<script lang="ts">
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

  // helper imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  const { circle_check } = getIcons();

  export let loading = false;
  export let serviceable = false;
</script>

{#if loading}
  <div class="mt-8" data-testid="address-widget-loader">
    <WithEllipsis>
      <span id="loader-text">
        {$t(ADDRESS_WIDGET_LOADER_TEXT)}
      </span>
    </WithEllipsis>
  </div>
{:else if serviceable}
  <div
    id="address-serviceable-message"
    data-testid="address-serviceable-message"
    class="mt-8 out"
  >
    <span id="address-serviceable-text"
      >{$t(ADDRESS_WIDGET_SERVICEABLE_TEXT)}</span
    >
    <Icon icon={circle_check} />
  </div>
{:else}
  <div
    data-test-id="address-box-unserviceability"
    id="address-serviceability-error"
    class="mt-8"
  >
    {$t(ADDRESS_WIDGET_UNSERVICEABLE_TEXT)}
  </div>
{/if}

<style>
  #address-serviceable-text {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 150%;
    color: #79747e;
  }

  #address-serviceable-message {
    display: flex;
    gap: 6px;
  }

  #address-serviceability-error {
    font-size: 11px;
    line-height: 150%;
    color: #eb001b;
    background: #fff1f1;
    border-radius: 1px;
    padding: 6px 8px;
    opacity: 1;
  }

  .mt-8 {
    margin-top: 8px;
  }

  #loader-text {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 400;
    font-size: 12px;
    line-height: 150%;
    color: #79747e;
  }

  .out {
    animation-duration: 250ms;
    animation-name: element-out;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    -webkit-animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.17, 0, 1, 1);
    animation-delay: 2s;
  }

  @keyframes element-out {
    0% {
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 0;
      height: 0;
      margin: 0;
    }
  }
</style>
