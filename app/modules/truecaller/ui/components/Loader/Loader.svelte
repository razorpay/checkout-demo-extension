<script lang="ts">
  // svelte
  import { fly } from 'svelte/transition';

  // ui
  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // i18n
  import { t } from 'svelte-i18n';
  import { LOGGIN_IN_VIA_TRUECALLER } from 'truecaller/i18n/labels';

  const { rzp_brand_logo } = getIcons();

  export let loading = true;
  export let onBackPressed: () => void;

  export function preventBack() {
    onBackPressed();
    return true;
  }
</script>

<div
  transition:fly|local={{ duration: 200, y: 20 }}
  id="loader-modal"
  class="loading"
>
  <div class="message">{$t(LOGGIN_IN_VIA_TRUECALLER)}</div>
  <div class="spinner-container">
    <div class="spin"><div /></div>
    <div class="spin spin2"><div /></div>
  </div>
  <div class="branding">
    <span class="brand-text">Secured by</span>
    <Icon icon={rzp_brand_logo} />
  </div>
</div>

<style lang="css">
  #loader-modal {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .message,
  .spinner-container {
    margin-bottom: 40px;
  }

  .message {
    color: #333333;
    font-size: 14px;
    line-height: 20px;
    margin-top: 36px;
  }

  .spinner-container {
    position: relative;
  }

  .spin2 {
    position: absolute;
    top: 0;
    margin: auto;
    left: 0;
    right: 0;
  }

  .branding {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-text {
    font-size: 12px;
    line-height: 14px;
    color: #9f9f9f;
    padding-right: 4px;
  }
</style>
