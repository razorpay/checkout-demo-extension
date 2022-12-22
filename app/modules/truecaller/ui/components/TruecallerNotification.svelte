<script lang="ts">
  // i18n
  import { t } from 'svelte-i18n';
  import { UNABLE_TO_LOGIN_VIA_TRUECALLER_CALLOUT } from 'truecaller/i18n/labels';

  import Icon from 'ui/elements/Icon.svelte';
  import warningTriangle from '../icons/warning-triangle';
</script>

<div class="truecaller-notification">
  <div class="icon-wrapper"><Icon icon={warningTriangle()} /></div>
  <span class="message">{$t(UNABLE_TO_LOGIN_VIA_TRUECALLER_CALLOUT)}</span>
</div>

<style lang="css">
  .icon-wrapper {
    transform: translateY(2px) scale(0.9);
  }
  .truecaller-notification {
    background: rgba(209, 45, 45, 0.1);
    padding: 14px 20px;
    display: flex;
    align-items: center;
  }

  .message {
    font-size: 12px;
    color: #d12d2d;
    font-weight: 500;
    margin-left: 10px;
  }
</style>
