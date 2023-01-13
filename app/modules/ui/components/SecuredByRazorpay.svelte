<script lang="ts">
  import { t } from 'svelte-i18n';
  import { SECURED_BY, SECURED_BY_RAZORPAY } from 'account_modal/i18n/labels';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import { getThemeMeta, themeStore } from 'checkoutstore/theme';
  import { getIcon } from 'ui/icons/payment-methods';
  import { COLORS } from 'common/constants';

  $: isDarkColor = $themeStore.isDarkColor;
  export let withPrimaryBackground = false;
  $: rzp_brand_logo = getIcon('rzp_brand_logo', {
    foregroundColor:
      isDarkColor && withPrimaryBackground
        ? '#ffffff'
        : COLORS.RAZORPAY_LOGO_COLOR,
  }) as string;

  export let logos: string[] = [];
  export let lockIcon = false;

  export let columnView = false;
  export let withoutLogo = false;
</script>

{#if withoutLogo}
  <div class="rzp-icon-section rzp-row without-logo">
    <span class="brand-text-row">
      <Icon icon={getMiscIcon('lock', getThemeMeta()?.textColor)} />
      {$t(SECURED_BY_RAZORPAY)}
    </span>
  </div>
{:else}
  <div
    class:primary-bg={withPrimaryBackground}
    class="rzp-icon-section {columnView ? 'rzp-column' : 'rzp-row'}"
  >
    <span
      class={`${
        columnView ? 'brand-text' : 'brand-text-row'
      } brand-text-content`}
    >
      {#if lockIcon}
        <Icon icon={getMiscIcon('lock', getThemeMeta()?.textColor)} />
      {/if}
      {$t(SECURED_BY)}
    </span>
    {#if logos.length}
      <div class="d-flex align-center">
        {#each logos as logo, index}
          <Icon icon={logo} />
          {#if index !== logos.length - 1}
            <div class="vertical-separator bg-gray" />
          {/if}
        {/each}
      </div>
    {:else}
      <Icon icon={rzp_brand_logo} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .brand-text-content {
    :global(svg) {
      height: 12px;
      width: 12px;
      margin-right: 4px;
    }
  }
  .brand-text {
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-regular);
    color: var(--tertiary-text-color);
    margin-right: 4px;
  }

  .brand-text-row {
    display: flex;
    font-size: 11px;
    font-weight: 400;
    color: var(--tertiary-text-color);
    margin-right: 5px;
  }

  .primary-bg {
    .brand-text-row {
      color: var(--text-color);
    }
  }

  .rzp-icon-section {
    display: flex;

    &.without-logo > .brand-text-row {
      color: var(--text-color);
      opacity: 0.9;
      display: flex;
      align-items: center;

      & > :global(svg) {
        height: 12px;
        width: 12px;
        margin-right: 2px;
      }
    }
  }

  .rzp-column {
    flex-direction: column;
    align-items: flex-end;
  }

  .rzp-row {
    align-items: center;
  }

  .d-flex {
    display: flex;
  }

  .align-center {
    align-items: center;
  }

  .vertical-separator {
    height: 12px;
    width: 1px;
    margin: 0px 4px;
  }

  .bg-gray {
    background-color: #ebebeb;
  }
</style>
