<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import Widget from 'one_click_checkout/common/ui/Widget.svelte';
  import GstinField from 'one_click_checkout/gstin/ui/GstinField.svelte';
  import OrderInstructionField from 'one_click_checkout/gstin/ui/OrderInstructionField.svelte';

  // store imports
  import {
    gstIn,
    orderInstruction,
    prevGSTIN,
    prevOrderInstruction,
  } from 'one_click_checkout/gstin/store';

  // utils imports
  import { enabledGSTIN, enabledOrderInstruction } from 'razorpay';

  onMount(() => {
    $prevGSTIN = $gstIn;
    $prevOrderInstruction = $orderInstruction;
  });
</script>

{#if enabledGSTIN() || enabledOrderInstruction()}
  <Widget>
    <div class="gstin-form">
      {#if enabledGSTIN()}
        <GstinField />
      {/if}
      {#if enabledGSTIN() && enabledOrderInstruction()}
        <div class="separator" />
      {/if}
      {#if enabledOrderInstruction()}
        <OrderInstructionField />
      {/if}
    </div>
  </Widget>
{/if}

<style>
  .gstin-form {
    font-size: var(--font-size-body);
    font-style: normal;
    font-weight: var(--font-weight-regular);
    line-height: 16px;
    letter-spacing: 0;
  }
  .separator {
    height: 16px;
  }
</style>
