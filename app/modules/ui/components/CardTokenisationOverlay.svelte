<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import { getMerchantName } from 'razorpay';
  import {
    RBI_TOKENISATION_GUIDELINE,
    CARD_TOKENISATION_WARNING,
    CARD_TOKENISATION_BENEFITS0,
    CARD_TOKENISATION_BENEFITS1,
    CARD_TOKENISATION_BENEFITS2,
    SECURE_CARD,
    SECURE_CARD_LATER,
  } from 'ui/labels/card';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { popStack } from 'navstack';
  import { CardEvents, Events } from 'analytics';
  import { hideCta, showCta } from 'cta';

  const name = getMerchantName() || 'this Merchant';
  const cardTokenisationWarning = formatTemplateWithLocale(
    CARD_TOKENISATION_WARNING,
    { name },
    $locale
  );

  export let onPositiveClick: () => void;
  export let onNegativeClick: () => void;

  onMount(() => {
    hideCta();
  });

  onDestroy(() => {
    showCta();
  });

  function clickedPositive() {
    popStack();
    onPositiveClick();
    Events.TrackBehav(CardEvents.SECURE_CARD_CLICKED);
  }

  function clickedNegative() {
    popStack();
    onNegativeClick();
    Events.TrackBehav(CardEvents.MAYBE_LATER_CLICKED);
  }
</script>

<div class="card-tokenisation-overlay">
  <div class="tokenisation-overlay-header">
    <Icon icon={getMiscIcon('warningCircle', '#e68d8d')} />
    <p class="theme tokenisation-warning-txt">
      {cardTokenisationWarning}
    </p>
  </div>

  <p class="tokenisation-benefits-txt-0">
    {$t(CARD_TOKENISATION_BENEFITS0)}
  </p>

  <div class="tokenisation-middle">
    <Icon icon={getMiscIcon('seekForward')} />
    <p class="tokenisation-benefits-txt-1">
      {$t(CARD_TOKENISATION_BENEFITS1)}
    </p>
  </div>
  <div class="tokenisation-middle">
    <Icon icon={getMiscIcon('invertedLock')} />
    <p class="tokenisation-benefits-txt-2">{$t(CARD_TOKENISATION_BENEFITS2)}</p>
  </div>
  <p class="rbi-guideline">
    {$t(RBI_TOKENISATION_GUIDELINE)}
  </p>
  <button class="cta-button btn" on:click={clickedPositive}>
    {$t(SECURE_CARD)}</button
  >
  <button class="later-button btn" on:click={clickedNegative}
    >{$t(SECURE_CARD_LATER)}</button
  >
</div>

<style>
  .card-tokenisation-overlay {
    display: flex;
    flex-direction: column;
    white-space: normal;
    padding: 20px;
    text-align: left;
  }
  .tokenisation-overlay-header {
    border-bottom: 3px solid #f3f4f6;
    display: flex;
    align-items: center;
    padding-bottom: 20px;
  }
  .btn {
    font-size: 16px;
    margin-top: 8px;
    text-transform: none;
    border-radius: 6px;
    font-weight: 600;
  }
  .later-button {
    text-transform: none;
    background-color: white;
    color: #808ea3;
    border-style: solid;
    border-color: #e7ebef;
    font-weight: 500;
    margin-top: 16px;
  }

  .tokenisation-benefits-txt-0 {
    color: #3d5172;
    font-size: 12px;
    margin: 16px 0 0;
  }
  .tokenisation-benefits-txt-1 {
    color: #354a6c;
    text-align: left;
    margin: 20px 0 18px;
    padding-left: 14px;
  }
  .tokenisation-benefits-txt-2 {
    color: #354a6c;
    text-align: left;
    margin: 0;
    padding-left: 14px;
  }
  .tokenisation-warning-txt {
    font-weight: 600;
    padding-left: 14px;
    margin: 0;
  }

  .rbi-guideline {
    color: #97a0a9;
    font-size: 11px;
    margin: 20px 0 8px;
  }

  .tokenisation-middle {
    display: flex;
    align-items: center;
  }
</style>
