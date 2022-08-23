<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { CTA_LABEL } from 'cta/i18n';

  const dispatch = createEventDispatcher();

  export let disabled = false;
  export let fullWidth = false;
  export let handleDisable = false;
</script>

<div class="one-cc-cta-wrapper" class:full-width={fullWidth}>
  <button
    disabled={handleDisable ? false : disabled}
    class:disabled
    id="one-cc-cta"
    on:click|preventDefault={(e) => dispatch('click', e)}
  >
    <slot>{$t(CTA_LABEL)}</slot>
  </button>
</div>

<style>
  .one-cc-cta-wrapper {
    width: 70%;
    max-width: 70%;
    margin-left: auto;
    position: relative;
  }

  .one-cc-cta-wrapper.full-width {
    width: 100%;
    min-width: 100%;
  }

  #one-cc-cta::after {
    left: 0;
    top: 0;
    opacity: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  }

  #one-cc-cta:hover::after {
    opacity: 0;
  }

  #one-cc-cta.disabled {
    background: #cdd2d6;
  }

  #one-cc-cta {
    width: 100%;
    padding: 18px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;

    color: var(--text-color);
    background: var(--primary-color);
  }
</style>
