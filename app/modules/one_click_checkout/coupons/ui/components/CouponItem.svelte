<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    APPLY_LABEL,
    TERMS_CONDITION_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';

  // icon imports
  import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';

  export let coupon;

  const dispatch = createEventDispatcher();

  let expanded = false;
</script>

<div class="coupon-item">
  <div class="row justify-between">
    <div class="coupon-item-code">
      <p>{coupon.code}</p>
    </div>
    <button
      data-test-id="coupon-{coupon.code}"
      id="coupon-item-apply"
      class="theme apply-button"
      on:click|preventDefault={() => dispatch('apply')}
    >
      {$t(APPLY_LABEL)}
    </button>
  </div>
  <hr />
  <div class="coupon-item-container">
    <div>
      <p class="coupon-item-summary">{coupon.summary}</p>
      {#if coupon.description}
        <p class="coupon-item-description">
          {coupon.description}
        </p>
      {/if}
    </div>
    <span
      class="down-arrow"
      class:up-arrow={expanded}
      on:click={() => (expanded = !expanded)}
    >
      <Icon icon={arrow_down()} />
    </span>
  </div>
  {#if expanded}
    <div>
      <ul class="terms-section">
        {#each coupon.tnc as term, _}
          <li>{term}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  hr {
    border: 1px solid #e6e7e8;
    margin: 12px 0;
    border-bottom-width: 0;
  }

  button {
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
  }

  .coupon-item-container {
    display: flex;
    justify-content: space-between;
    padding-right: 8px;
  }
  .down-arrow {
    height: 15px;
    cursor: pointer;
  }

  .up-arrow {
    transform: rotate(180deg);
  }

  .coupon-item-description {
    font-style: normal;
    font-size: 12px;
    line-height: 16px;
    color: #8d97a1;
    text-transform: capitalize;
  }

  .coupon-item-summary {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #263a4a;
    margin-bottom: 6px;
    text-transform: capitalize;
  }

  .coupon-item {
    border-radius: 2px;
    border: 1px solid #e6e7e8;
    padding: 16px;
    margin-top: 20px;
    text-align: start;
    white-space: initial !important;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  ul {
    padding-inline-start: 0px;
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    font-weight: normal;
    font-size: 12px;
    line-height: 24px;
    color: #263a4a;
    list-style: none;
  }

  li {
    line-height: 16px;
    padding-bottom: 4px;
    color: #8d97a1;
  }

  .terms-section {
    font-style: normal;
  }

  .apply-button {
    font-weight: 600;
  }

  .coupon-item-code {
    padding: 4px 8px;
    background-color: var(--secondary-highlight-color);
    color: var(--highlight-color);
    font-weight: 800;
    font-size: 14px;
    line-height: 20px;
    border: 1px dashed var(--highlight-color);
    word-break: break-all;
  }
</style>
