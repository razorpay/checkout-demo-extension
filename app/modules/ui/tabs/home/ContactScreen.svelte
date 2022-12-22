<script lang="ts">
  // store imports
  import { isRedesignV15 } from 'razorpay';
  // UI Imports
  import PaymentDetails from './PaymentDetails.svelte';

  export let tpv;
  export let onSubmit;
  export let onSubmitClick;
  export let disabled;
  export let shouldUpdateEmail = false;

  const isRedesignV15Enabled = isRedesignV15();
</script>

<PaymentDetails
  {tpv}
  {onSubmit}
  ctaV15={isRedesignV15Enabled}
  bind:onSubmitClick
  bind:disabled
  {shouldUpdateEmail}
/>
