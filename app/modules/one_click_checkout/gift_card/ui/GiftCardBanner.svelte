<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import GiftCardItem from 'one_click_checkout/gift_card/ui/GiftCardItem.svelte';
  import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';
  import gift_card from 'one_click_checkout/gift_card/icons/giftcard';

  // store imports
  import {
    appliedGiftCards,
    totalAppliedGCAmt,
  } from 'one_click_checkout/gift_card/store';
  import { amount, isCodAddedToAmount } from 'one_click_checkout/charges/store';
  import { appliedOffer } from 'offers/store/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    GIFT_CARD,
    APPLIED,
    REMOVE,
  } from 'one_click_checkout/gift_card/i18n/labels';
  import {
    getLabel,
    GC_BANNER_LABEL,
  } from 'one_click_checkout/gift_card/i18n/helpers';

  // session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // utils imports
  import { showGiftCardModal } from 'one_click_checkout/gift_card';
  import {
    enabledRestrictCoupon,
    getCurrency,
    enabledMultipleGiftCard,
  } from 'razorpay';
  import { formatAmountWithSymbol } from 'common/currency';
  import {
    removeGiftCard,
    restrictBuyGCViaGC,
    restrictCODWithGC,
  } from 'one_click_checkout/gift_card/helpers';

  // constant imports
  import { MANUAL_GC_SOURCE } from 'one_click_checkout/gift_card/constants';

  const { circle_arrow_next, giftCard } = getIcons();
  const restrictCoupon = enabledRestrictCoupon();
  const spaceAmountWithSymbol = false;
  const allowMultipleGiftCard = enabledMultipleGiftCard();
  const disableGCColor = '#adaeaf';
  const getDisableGC = () =>
    restrictBuyGCViaGC() || restrictCODWithGC() || $appliedOffer;
  const setDisableGCBanner = () => {
    disableGC = getDisableGC();
    bannerSubtitle = getLabel(GC_BANNER_LABEL);
  };
  let allowGiftCardApply = false;
  let isMinTotalAmt = false;
  let disableGC = getDisableGC();
  let bannerSubtitle = getLabel(GC_BANNER_LABEL);
  $: $amount, (isMinTotalAmt = $amount === 100);
  $: $isCodAddedToAmount, $appliedOffer, setDisableGCBanner();

  const showModal = () => {
    if (allowGiftCardApply && !isMinTotalAmt && !disableGC) {
      showGiftCardModal();
    }
  };

  const handleRemoveGiftCard = () => {
    removeGiftCard([$appliedGiftCards[0]?.giftCardNumber], MANUAL_GC_SOURCE);
  };

  $: $appliedGiftCards,
    (allowGiftCardApply = allowMultipleGiftCard || !$appliedGiftCards?.length);
</script>

<div>
  <h3 class="title">{$t(GIFT_CARD)}</h3>
  <div class="banner">
    <div
      class="gift-card-sec"
      data-testid="gift-card-sec"
      data-test-id="gift-card-sec"
      on:click={showModal}
      class:pointer={allowGiftCardApply && !isMinTotalAmt && !disableGC}
    >
      <div class="gift-card-icon">
        <Icon
          icon={disableGC
            ? gift_card(disableGCColor, disableGCColor)
            : giftCard}
        />
      </div>
      <div class={disableGC ? 'info-disable' : 'info'}>
        <p class="banner-title" class:disble-title={disableGC}>
          {$t(GIFT_CARD)}
        </p>
        {#if $totalAppliedGCAmt}
          <div class="label-success">
            <Icon icon={circle_check(12, 12)} />
            <span class="amount" data-testid="amount">
              {`${formatAmountWithSymbol(
                $totalAppliedGCAmt,
                getCurrency(),
                spaceAmountWithSymbol
              )} ${$t(APPLIED)}`}
            </span>
          </div>
        {:else}
          <p
            class="subtitle"
            class:highlight-text={restrictCoupon && !disableGC}
            class:disble-subtitle={disableGC}
          >
            {$t(bannerSubtitle)}
          </p>
        {/if}
      </div>
      {#if !disableGC}
        {#if allowGiftCardApply}
          <div
            class="arrow-btn"
            data-testid="arrow-btn"
            class:disable-arrow-btn={isMinTotalAmt}
          >
            <Icon icon={circle_arrow_next} />
          </div>
        {:else}
          <button
            data-testid="rmv-btn"
            data-test-id="rmv-btn"
            class="rmv-btn"
            on:click|stopPropagation={handleRemoveGiftCard}
          >
            {$t(REMOVE)}
          </button>
        {/if}
      {/if}
    </div>
    {#if allowMultipleGiftCard && $appliedGiftCards?.length}
      <hr />
      <div class="list-sec">
        {#each $appliedGiftCards as { giftCardNumber }}
          <GiftCardItem {giftCardNumber} />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .banner {
    border: 1px solid var(--light-dark-color);
    padding: 10px 0;
    display: flex;
    flex-direction: column;
  }
  .subtitle {
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-small);
    color: var(--tertiary-text-color);
    margin: 4px 0 0;
  }
  .highlight-text {
    color: var(--primary-color);
  }
  .gift-card-icon {
    margin-right: 16px;
    margin-top: 2px;
  }
  .info {
    width: 80%;
  }

  .info-disable {
    width: 85%;
  }

  .arrow-btn {
    text-align: right;
  }
  .label-success {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    color: var(--positive-text-color);
    display: flex;
    align-items: center;
    padding-top: 2px;
  }
  .amount {
    padding-left: 6px;
  }
  hr {
    border: 1px solid var(--light-dark-color);
    border-bottom: none;
    width: 94%;
    margin-top: 10px;
    margin-bottom: 0;
  }
  .gift-card-sec {
    display: flex;
    align-items: flex-start;
    padding: 0 16px;
  }
  .list-sec {
    display: flex;
    padding: 0 16px;
    flex-wrap: wrap;
  }
  .rmv-btn {
    color: var(--primary-color);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    padding-right: 0;
  }
  .pointer {
    cursor: pointer;
  }

  .disable-arrow-btn {
    opacity: 0.3;
  }

  .banner-title {
    margin: 0;
  }

  .disble-subtitle {
    color: #adaeaf;
  }
  .disble-title {
    color: #676a6d;
  }
  :global(#form .rmv-gc-card > .wrapper .content) {
    align-items: start;
    padding-left: 16px;
  }
</style>
