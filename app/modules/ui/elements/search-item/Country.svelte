<script lang="ts">
  // components
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_up from 'account_modal/icons/arrow_up';

  // constants
  import RazorpayConfig from 'common/RazorpayConfig';
  import { constantCSSVars } from 'common/constants';

  // props
  export let item: { type: string; label: string; key: string };
  /**
   * Optional prop to add redesign styles on this component
   */
  export let isRedesign = false;

  const countryFlagsUrl = `${RazorpayConfig.cdn}country-flags/`;
</script>

<div class="list-data">
  {#if item.type === 'country'}
    <span>
      <img
        class="icon"
        alt={item.label}
        src={`${countryFlagsUrl}${item.key}.svg`}
      />
    </span>
  {/if}
  <span>{item.label}</span>
  {#if isRedesign}
    <span class="icon-right">
      <Icon icon={arrow_up(10, 6, constantCSSVars['primary-text-color'])} />
    </span>
  {/if}
</div>

<style lang="scss">
  .list-data {
    display: flex;
    align-items: center;
  }

  .list-data img {
    margin-right: 10px;
    width: 20px;
    vertical-align: middle;
  }

  :global(.redesign) {
    .list-data {
      width: 100%;
    }

    .icon {
      object-fit: cover;
      height: 20px;
      border-radius: 50%;
    }
    .icon-right {
      margin-left: auto;
      transform: rotate(90deg);
    }
  }
</style>
