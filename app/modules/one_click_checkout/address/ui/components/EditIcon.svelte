<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // ui imports
  import DropdownMenu from 'one_click_checkout/common/ui/DropdownMenu.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n imports
  import { EDIT_ADDRESS_LABEL } from 'one_click_checkout/address/i18n/labels';
  import { t } from 'svelte-i18n';

  // utils imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  const dispatch = createEventDispatcher();
  const { kebab_menu } = getIcons();
  let dropdownTrigger;
</script>

<DropdownMenu triggerElement={dropdownTrigger} on:click>
  <button
    class="dropdown-btn"
    data-test-id="edit-cta"
    bind:this={dropdownTrigger}
  >
    <Icon icon={kebab_menu} />
  </button>
  <div slot="dropdown_menu">
    <button
      data-test-id="edit-menu-cta"
      class="dropdown-item"
      type="button"
      on:click={() => dispatch('editClick')}
    >
      {$t(EDIT_ADDRESS_LABEL)}
    </button>
  </div>
</DropdownMenu>

<style>
  * {
    padding: 0px;
    margin: 0px;
    border: none;
    box-sizing: border-box;
  }
  .dropdown-item {
    font-weight: var(--font-weight-medium);
    padding: 10px 20px;
    color: var(--secondary-text-color);
  }
  .dropdown-btn {
    padding: 0 8px;
  }
</style>
