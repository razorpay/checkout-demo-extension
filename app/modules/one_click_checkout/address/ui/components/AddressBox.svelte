<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // ui imports
  import EditIcon from 'one_click_checkout/address/ui/components/EditIcon.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    NON_SERVICEABLE_LABEL,
    SAVED_ADDRESS_LANDMARK_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  // constant imports
  import Shimmer from 'one_click_checkout/common/ui/Shimmer.svelte';

  // utils imports
  import { findCountryCode } from 'common/countrycodes';
  import { getI18nForTag } from 'one_click_checkout/address/helpersExtra';

  export let address;
  export let isSelected = false;
  export let checkServiceability = true;
  export let loading = false;
  export let withBorder = true;
  export let isEditable = true;

  const dispatch = createEventDispatcher();
  let phoneCode = '';
  let phoneNum = '';

  $: isServiceable = !(!address.serviceability && checkServiceability);

  $: if (typeof address.contact === 'string') {
    ({ code: phoneCode, phone: phoneNum } = findCountryCode(address?.contact));
  }
</script>

{#if loading}
  <div
    data-testid="address-shimmer"
    class="card shimmer-card"
    class:card-border={withBorder}
  >
    <Shimmer height={20} width="40%" />
    <div class="spacing-14" />
    <Shimmer width="35%" />
    <div class="spacing-14" />
    <Shimmer />
    <div class="spacing-6" />
    <Shimmer />
    <div class="spacing-6" />
    <Shimmer />
    <div class="spacing-6" />
    <Shimmer />
  </div>
{:else}
  <button
    data-testid="address-box"
    id={`address-container${isSelected ? '-selected' : ''}`}
    class="card address-container"
    class:card-border={withBorder}
    class:selected-container={isSelected}
    on:click|preventDefault={() => dispatch('select')}
  >
    {#if isEditable}
      <div class="edit-cta" data-testid="address-edit-cta">
        <EditIcon
          on:click={() => dispatch('select')}
          on:editClick={() => dispatch('editClick', address)}
        />
      </div>
    {/if}
    <div class:disabled={!isServiceable} class="box-header">
      <div class="box-title">
        <span class="address-name">
          {address.name}
        </span>
        {#if address.tag}
          <div class="address-tag">{$t(getI18nForTag(address.tag))}</div>
        {/if}
      </div>
    </div>
    <div>
      <div class:disabled={!isServiceable}>
        {#if address.contact}
          <p class="address-phone-number">+{phoneCode} {phoneNum}</p>
        {/if}
        <p class="address-text">{address.formattedLine1}</p>
        <p class="address-text">{address.formattedLine2}</p>
        <p class="address-text">{address.formattedLine3}</p>
        {#if address.landmark}
          <div class="address-text address-landmark ">
            {$t(SAVED_ADDRESS_LANDMARK_LABEL)}:
            {address.landmark}
          </div>
        {/if}
      </div>
      <slot>
        {#if !isServiceable}
          <div
            data-testid="address-box-unserviceability"
            data-test-id="address-box-unserviceability"
            class="address-serviceability-error"
          >
            {$t(NON_SERVICEABLE_LABEL)}
          </div>
        {/if}
      </slot>
    </div>
  </button>
{/if}

<style>
  * {
    padding: 0px;
    margin: 0px;
    border: none;
    box-sizing: border-box;
  }

  .disabled {
    opacity: 0.6;
  }

  .address-landmark {
    font-size: 12px;
  }
  .address-serviceability-error {
    font-size: 11px;
    margin-top: 12px;
    color: #eb001b;
    background: #fff1f1;
    border-radius: 1px;
    padding: 6px 8px;
    opacity: 1;
  }
  .address-container {
    text-align: left;
    transition-duration: 0.15s;
    transition-property: border;
    transition-timing-function: linear;
    position: relative;
  }

  .card {
    width: 100%;
    color: inherit;
  }

  .card-border {
    border: 1px solid #e0e0e0;
    border-radius: 2px;
    padding: 22px 16px 20px;
  }

  .box-header {
    display: flex;
    margin-bottom: 10px;
  }

  .edit-cta {
    position: absolute;
    top: 26px;
    right: 16px;
    z-index: 1;
  }

  .box-title {
    display: flex;
  }
  .address-name {
    margin-right: 4px;
    font-size: 14px;
    text-transform: capitalize;
  }
  .address-tag {
    font-size: 10px;
    color: #263a4a;
    background: #eef4f9;
    border-radius: 2px;
    padding: 2px 4px 3px;
    align-self: baseline;
    font-weight: 500;
    line-height: 14px;
  }
  .address-text {
    font-size: 14px;
    line-height: 20px;
    color: #8d97a1;
  }

  .selected-container {
    border: 1px solid var(--highlight-color);
  }
  .shimmer-card {
    position: relative;
    overflow: hidden;
  }

  .spacing-14 {
    height: 14px;
  }

  .spacing-6 {
    height: 6px;
  }

  .address-phone-number {
    font-size: 14px;
    line-height: 22px;
  }
</style>
