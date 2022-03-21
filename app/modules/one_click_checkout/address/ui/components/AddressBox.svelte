<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';
  // ui imports
  import DropdownMenu from 'one_click_checkout/common/ui/DropdownMenu.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    EDIT_ADDRESS_LABEL,
    NON_SERVICEABLE_LABEL,
    SAVED_ADDRESS_LANDMARK_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // constant imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import Shimmer from 'one_click_checkout/common/ui/Shimmer.svelte';

  export let address;
  export let isSelected = false;
  export let checkServiceability = true;
  export let loading = false;
  export let withBorder = true;
  export let isEditable = true;

  const { kebab_menu } = getIcons();
  const dispatch = createEventDispatcher();
  let dropdownTrigger;

  $: isServiceable = !(address.serviceability === false && checkServiceability);
</script>

{#if loading}
  <div class="card shimmer-card" class:card-border={withBorder}>
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
    id={`address-container${isSelected ? '-selected' : ''}`}
    class="card address-container"
    class:card-border={withBorder}
    class:selected-container={isSelected}
    on:click|preventDefault={() => dispatch('select')}
  >
    {#if isEditable}
      <div class="edit-cta">
        <DropdownMenu
          triggerElement={dropdownTrigger}
          on:click={() => dispatch('select')}
        >
          <button bind:this={dropdownTrigger}>
            <Icon icon={kebab_menu} />
          </button>
          <div slot="dropdown_menu">
            <button
              class="dropdown-item"
              type="button"
              on:click={() => dispatch('editClick', address)}
            >
              {$t(EDIT_ADDRESS_LABEL)}
            </button>
          </div>
        </DropdownMenu>
      </div>
    {/if}
    <div class:disabled={!isServiceable} class="box-header">
      <div class="box-title">
        <span class="address-name">
          {address.name}
        </span>
        {#if address.tag}
          <div class="address-tag">{address.tag}</div>
        {/if}
      </div>
    </div>
    <div class="address-text">
      <div class:disabled={!isServiceable}>
        {#if address.contact}
          <p>{address.contact}</p>
        {/if}
        <p>{address.formattedLine1}</p>
        <p>{address.formattedLine2}</p>
        {#if address.landmark}
          <div class="address-landmark">
            {$t(SAVED_ADDRESS_LANDMARK_LABEL)}:
            {address.landmark}
          </div>
        {/if}
      </div>
      <!-- address.serviceability will be null for unknown serviceability -->
      {#if !isServiceable}
        <div class="address-serviceability-error">
          {$t(NON_SERVICEABLE_LABEL)}
        </div>
      {/if}
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
    font-size: 12px;
    margin-top: 12px;
    color: #eb001b;
    background: #fff1f1;
    border-radius: 1px;
    padding: 4px 8px;
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
    padding: 26px 16px 20px;
  }

  .box-header {
    display: flex;
    margin-bottom: 10px;
  }

  .edit-cta {
    position: absolute;
    top: 26px;
    right: 20px;
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
    background: #f2f6fb;
    border-radius: 2px;
    padding: 2px 4px 3px;
    align-self: baseline;
    font-weight: 500;
    line-height: 14px;
  }
  .address-text {
    line-height: 22px;
    color: #8d97a1;
  }

  .dropdown-item {
    font-weight: 500;
    padding: 10px 20px;
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
</style>
