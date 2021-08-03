<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getThemeColor } from 'checkoutstore/theme';

  export let callout = null;
  export let buttonText = null;

  const dispatch = createEventDispatcher();

  function onConfirm() {
    dispatch('action', {
      action: 'confirm',
    });
  }
</script>

<div class="auth-overlay">
  <span class="desc">{callout}</span>
  <button class="btn" on:click={onConfirm}>{buttonText}</button>
</div>

<style>
  .auth-overlay {
    display: flex;
    flex-direction: column;
    white-space: normal;
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
