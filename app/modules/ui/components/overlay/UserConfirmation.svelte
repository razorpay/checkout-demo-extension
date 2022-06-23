<script lang="ts">
  export let callout = null;
  export let buttonText = null;
  export let onConfirm;
</script>

<div class="user-confirmation-overlay">
  <span class="desc">{callout}</span>
  <button class="btn" on:click={() => onConfirm?.()}>{buttonText}</button>
</div>

<style>
  .user-confirmation-overlay {
    display: flex;
    flex-direction: column;
    white-space: normal;
    padding: 20px;
  }
  .desc {
    font-size: 12px;
    text-align: left;
    color: #757575;
    line-height: 16px;
  }
  .btn {
    font-size: 14px;
    margin-top: 16px;
  }
</style>
