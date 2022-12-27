<script lang="ts">
  import logo from '../icons/logo';
  import Icon from 'ui/elements/Icon.svelte';

  import { createEventDispatcher } from 'svelte';
  import { triggerTruecallerIntent } from 'truecaller/core';
  import { TRUECALLER_VARIANT_NAMES } from 'truecaller/constants';
  import { Events } from 'analytics';
  import { EVENTS } from 'truecaller/analytics/events';

  const dispatch = createEventDispatcher();

  function onClick(e) {
    e.preventDefault();
    dispatch('click');

    triggerTruecallerIntent({}, TRUECALLER_VARIANT_NAMES.contact_screen)
      .then((res) => dispatch('success', res))
      .catch((e) => dispatch('error', e));
    Events.TrackBehav(EVENTS.LOGIN_FROM_TRUECALLER_CLICKED);
  }
</script>

<div class="truecaller-login" on:click={onClick}>
  <span class="prefix">Login via</span>
  <Icon icon={logo()} alt="truecaller-logo" />
  <span class="arrow-right theme-highlight-color">&#xe604;</span>
</div>

<style lang="css">
  .truecaller-login {
    display: flex;
    font-size: 12px;
    line-height: 12px;
    color: rgba(22, 47, 86, 0.54);
    background-color: transparent;
    border: none;
  }
  .prefix {
    width: auto;
    padding-right: 4px;
  }

  .arrow-right {
    transform: rotate(180deg) translateY(-1px);
    font-size: 8px;
    opacity: 0.5;
  }
</style>
