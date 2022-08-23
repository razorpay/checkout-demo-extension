<script lang="ts">
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { _ as t } from 'svelte-i18n';
  import { ID_LINKED_TO_BANK } from 'ui/labels/upi';
  import { getSupportedBankForUPIRecurring } from './helpers';

  export let value = null;
  const banksThatSupportRecurring = getSupportedBankForUPIRecurring();
</script>

<div class="legend left">{$t(ID_LINKED_TO_BANK)}</div>
<div class="border-list" id="upi-recurring-bank-list">
  {#each banksThatSupportRecurring as bank}
    <SlottedRadioOption
      name="upi_recurring_psp_bank"
      ellipsis
      selected={(value && value.id) === bank.id}
      on:click={() => {
        value = bank;
      }}
    >
      <div slot="title" id={`upi-psp-bank-${bank.id}`}>{bank.name}</div>
      <i slot="icon">
        <Icon icon={`https://cdn.razorpay.com/bank/${bank.img}.gif`} />
      </i>
    </SlottedRadioOption>
  {/each}
</div>

<style>
  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }

  :global(.redesign) .legend {
    margin-top: 4px;
  }
</style>
