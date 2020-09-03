<script>
  import { t } from 'svelte-i18n';
  import {
    CANCEL_REASON_TITLE,
    CANCEL_REASON_COLLECT_NOT_RECEIVED,
    CANCEL_REASON_FAILED_IN_APP,
    CANCEL_REASON_MONEY_DEDUCTED,
    CANCEL_REASON_OTHER,
    CANCEL_REASON_BACK_ACTION,
    CANCEL_REASON_SUBMIT_ACTION,
  } from 'ui/labels/upi';

  export let title = '';
  export let method = 'netbanking';
  export let reasons = [];

  export let onBack = () => {};
  export let onSubmit = () => {};

  let prefixGenerator;

  const pg = (prefixGenerator = text => `${method}-${text}`);
</script>

<!-- LABEL: Please give us a reason before we cancel the payment -->
<p>{$t(title)}</p>

{#each reasons as reason, i (reason.value)}
  <label for={pg(i)}>
    <input id={pg(i)} type="radio" name="_[reason]" value={reason.value} />
    <!-- LABEL: Did not receive collect request -->
    {$t(reason.label)}
  </label>
{/each}
<div class="buttons">
  <!-- LABEL: Back -->
  <button class="back-btn" on:click={onBack}>
    {$t(CANCEL_REASON_BACK_ACTION)}
  </button>
  <!-- LABEL: Submit -->
  <button class="btn" on:click={onSubmit}>
    {$t(CANCEL_REASON_SUBMIT_ACTION)}
  </button>
</div>
