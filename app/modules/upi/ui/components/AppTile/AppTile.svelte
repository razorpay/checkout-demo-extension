<script lang="ts">
  import { getUpiIntentAppName } from 'i18n';
  import { locale } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';

  // Props
  export let variant: UPI.AppTileVariant = 'square';
  export let app: UPI.AppConfiguration;
  export let selected = false;

  export let onClick: (event: MouseEvent) => void;

  function onTileClick(event: MouseEvent) {
    event.stopPropagation();
    onClick(event);
  }
</script>

<div class="upi-app-tile">
  <div
    class="app-tile"
    data-testid="app-tile"
    data-appId={app.shortcode}
    class:selected
    class:square-tile={variant === 'square'}
    class:option={variant === 'square'}
    class:circle-tile={variant === 'circle'}
    on:click={onTileClick}
  >
    <i class={`${variant}-icon`}>
      <Icon
        icon={app.app_icon ||
          `https://cdn.razorpay.com/app/${app.shortcode}.svg`}
      />
    </i>
  </div>
  {#if variant === 'square'}
    <div class="app-title">
      {getUpiIntentAppName(app.shortcode, $locale, app.app_name || app.name)}
    </div>
  {/if}
  <slot />
</div>

<style lang="css">
  .upi-app-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .app-title {
    font-size: 10px;
    line-height: 12px;
    color: #828282;
    text-align: center;
    padding: 4px 0px;
  }
  .app-tile {
    border: 1px solid rgba(22, 47, 86, 0.1);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .square-tile {
    border-radius: 6px !important;
    padding: 8px;
    width: 50px;
    height: 50px;
  }
  .circle-tile {
    border-radius: 20px;
    padding: 3px;
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  :global(.square-icon > img),
  :global(.square-icon > svg) {
    /** don't set hieght, it will squish the icon*/
    height: auto;
    width: 34px;
    display: block;
    flex: 1 1 0;
  }

  :global(div[data-appid='others'] > .square-icon > img),
  :global(div[data-appid='others'] > .square-icon > svg) {
    width: 18px;
  }

  :global(.circle-icon > img),
  :global(.circle-icon > svg) {
    height: auto;
    width: 10px;
    display: block;
    flex: 1 1 0;
  }

  :global(.one-cc) .circle-icon {
    display: flex;
  }

  :global(.one-cc) .app-title {
    padding: 4px 0px;
  }
</style>
