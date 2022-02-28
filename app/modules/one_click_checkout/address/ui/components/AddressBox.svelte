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
    SAVED_ADDRESS_PHONE_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // constant imports
  import { COUNTRY_POSTALS_MAP } from 'common/countrycodes';
  import { getIcons } from 'one_click_checkout/sessionInterface';

  export let address;
  export let isSelected = false;
  export let onClick;
  export let checkServiceability = true;

  const { kebab_menu } = getIcons();
  const dispatch = createEventDispatcher();
  let dropdownTrigger;

  $: isServiceable = !(
    address['serviceability'] === false && checkServiceability
  );

  const getCountryName = (countryISO) => {
    const rows = Object.entries(COUNTRY_POSTALS_MAP);
    for (const [iso, countryInfo] of rows) {
      if (countryISO && countryISO.toUpperCase() === iso) {
        return countryInfo.name;
      }
    }
  };
</script>

<button
  id={`address-container${isSelected ? '-selected' : ''}`}
  class="address-container"
  class:selected-container={isSelected}
  on:click|preventDefault={() => dispatch('selectAddress')}
>
  <div class:disabled={!isServiceable} class="box-header">
    <div class="box-title">
      <span class="address-name">
        {address['name']}
      </span>
      {#if address['tag']}
        <div class="address-tag">{address['tag']}</div>
      {/if}
    </div>
    <DropdownMenu
      triggerElement={dropdownTrigger}
      on:click={() => dispatch('selectAddress')}
    >
      <button bind:this={dropdownTrigger}>
        <Icon icon={kebab_menu} />
      </button>
      <div slot="DropdownMenu">
        <button
          class="dropdown-item"
          type="button"
          on:click={() => dispatch('editAddressClick', address)}
          >{$t(EDIT_ADDRESS_LABEL)}</button
        >
      </div>
    </DropdownMenu>
  </div>
  <div class="address-text">
    <div class:disabled={!isServiceable}>
      <div>
        <!-- the regex deletes any leading or trailing commas -->
        {`${address['line1'] ?? ''}, ${address['line2'] ?? ''}`
          .trim()
          .replace(/(^,)|(,$)/g, '')}
      </div>
      <div>
        {`${address['city']}, ${address['state']}, ${getCountryName(
          address['country']
        )}, ${address['zipcode']}`}
      </div>
      {#if address['landmark']}
        <div class="address-landmark">
          {$t(SAVED_ADDRESS_LANDMARK_LABEL)}:
          {address['landmark']}
        </div>
      {/if}
      {#if address['contact']}
        <div>
          {$t(SAVED_ADDRESS_PHONE_LABEL)}:
          {address['contact']}
        </div>
      {/if}
    </div>
    <!-- address['serviceability'] will be null for unknown serviceability -->
    {#if !isServiceable}
      <div class="address-serviceability-error">
        {$t(NON_SERVICEABLE_LABEL)}
      </div>
    {/if}
  </div>
</button>

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
    color: inherit;
    background: #fdfdfd;
    border: 1px solid #e0e0e0;
    width: 100%;
    margin-bottom: 24px;
    padding: 26px 16px 20px;
    border-radius: 2px;
    text-align: left;

    transition-duration: 0.15s;
    transition-property: border;
    transition-timing-function: linear;
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .box-title {
    display: flex;
  }
  .address-name {
    margin-right: 4px;
    font-size: 14px;
  }
  .address-tag {
    font-size: 10px;
    color: #263a4a;
    background: #f2f6fb;
    border-radius: 2px;
    padding: 2px 4px;
    align-self: baseline;
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
    border: 1px solid var(--background-color);
  }
</style>
