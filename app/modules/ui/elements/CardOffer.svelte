<script lang="ts">
  import { formatAmountWithSymbol } from 'common/currency';

  import { formatTemplateWithLocale } from 'i18n';

  import { getCurrency, isRedesignV15 } from 'razorpay';
  import { locale } from 'svelte-i18n';
  import { YOU_SAVE_MESSAGE } from 'ui/labels/offers';

  export let offer;

  $: discount = offer?.original_amount - offer?.amount;
</script>

<div class="pad card-offer">
  {#if offer.name}
    <div class="text-btn">
      <strong>{offer.name}</strong>
    </div>
  {/if}
  {#if isRedesignV15() && discount && !window.isNaN(discount)}
    <span class="you-save">
      {formatTemplateWithLocale(
        YOU_SAVE_MESSAGE,
        {
          amount: formatAmountWithSymbol(discount, getCurrency(), false),
        },
        $locale
      )}
    </span>
  {:else if offer.display_text}{offer.display_text}{/if}
</div>

<style lang="scss">
  .card-offer {
    pointer-events: none;
    font-size: 12px;
    padding-bottom: 14px;
  }

  :global(.redesign) {
    .card-offer {
      padding: 6.25px 16px !important;
      width: 100%;
      background: linear-gradient(0deg, #effcf4, #effcf4), #ffffff;
      border: 1px solid #effcf4;
      box-shadow: 0px -2px 2px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;

      &:before {
        content: '\e717';
        font-size: 18px;
        margin: -1px 8px 0 0;
        color: var(--highlight-color);
      }

      .text-btn {
        margin-right: 5px;
        text-transform: initial;
      }

      .you-save {
        color: #70c692;
      }
    }
  }
</style>
