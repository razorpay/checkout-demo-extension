<script lang="ts">
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
</script>

<!-- LABEL: Please give us a reason before we cancel the payment -->
<p>{$t(CANCEL_REASON_TITLE)}</p>
<label for="upi-1">
  <input
    id="upi-1"
    type="radio"
    name="_[reason]"
    value="collect_not_received"
  />
  <!-- LABEL: Did not receive collect request -->
  {$t(CANCEL_REASON_COLLECT_NOT_RECEIVED)}
</label>
<label for="upi-2">
  <input id="upi-2" type="radio" name="_[reason]" value="failed_in_app" />
  <!-- LABEL: Payment failed in UPI app -->
  {$t(CANCEL_REASON_FAILED_IN_APP)}
</label>
<label for="upi-3">
  <input id="upi-3" type="radio" name="_[reason]" value="money_deducted" />
  <!-- Money got deducted but payment is still processing -->
  {$t(CANCEL_REASON_MONEY_DEDUCTED)}
</label>
<label for="upi-4">
  <input id="upi-4" type="radio" name="_[reason]" value="other" />
  <!-- LABEL: Other -->
  {$t(CANCEL_REASON_OTHER)}
</label>
<div class="buttons">
  <!-- LABEL: Back -->
  <button class="back-btn">{$t(CANCEL_REASON_BACK_ACTION)}</button>
  <!-- LABEL: Submit -->
  <button class="btn">{$t(CANCEL_REASON_SUBMIT_ACTION)}</button>
</div>
