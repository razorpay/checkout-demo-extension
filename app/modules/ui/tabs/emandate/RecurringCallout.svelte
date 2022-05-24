<script>
  import Bottom from 'ui/layouts/Bottom.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import { isRecurring } from 'razorpay';
  import { RECURRING_CALLOUT } from 'ui/labels/netbanking';
  import { t } from 'svelte-i18n';
</script>

<Bottom>
  <!-- Show recurring message for emandate recurring payments -->
  {#if isRecurring()}
    <Callout>{$t(RECURRING_CALLOUT)}</Callout>
  {/if}
</Bottom>
