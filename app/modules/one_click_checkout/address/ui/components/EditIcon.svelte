<script>
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
  <button bind:this={dropdownTrigger}>
    <Icon icon={kebab_menu} />
  </button>
  <div slot="dropdown_menu">
    <button
      class="dropdown-item"
      type="button"
      on:click={() => dispatch('editClick')}
    >
      {$t(EDIT_ADDRESS_LABEL)}
    </button>
  </div>
</DropdownMenu>

<style>
  .dropdown-item {
    font-weight: 500;
    padding: 10px 20px;
  }
</style>
