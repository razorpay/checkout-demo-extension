<script>
  export let coupon;
  export let selected;

  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { createEventDispatcher } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { t } from 'svelte-i18n';
  import {
    APPLY_LABEL,
    REMOVE_LABEL,
    COUPON_APPLIED_LABEL,
    MORE_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';

  const { tick_filled_donate } = getIcons();

  const dispatch = createEventDispatcher();

  let expanded = false;
</script>

<div class="coupon-item">
  <div class="row justify-between">
    <div class="coupon-item-code">
      <p>{coupon.code}</p>
    </div>
    {#if selected}
      <button class="remove-button" on:click={() => dispatch('remove')}
        >{$t(REMOVE_LABEL)}</button
      >
    {:else}
      <button class="theme-highlight" on:click={() => dispatch('apply')}
        >{$t(APPLY_LABEL)}</button
      >
    {/if}
  </div>
  {#if selected}
    <div class="row success-message">
      <Icon icon={tick_filled_donate} />
      <p class="text-green">{$t(COUPON_APPLIED_LABEL)}</p>
    </div>
  {/if}
  <hr />
  <p class="coupon-item-summary">{coupon.summary}</p>
  {#if coupon.description}
    <p class="coupon-item-description">
      {coupon.description}
    </p>
  {/if}
  {#if !expanded}
    <button
      class="theme-highlight show-details"
      on:click={() => (expanded = true)}>{$t(MORE_LABEL)}</button
    >
  {:else}
    <div>
      <p class="tnc-text">Terms and conditions</p>
      <ul>
        {#each coupon.tnc as term, _}
          <li>{term}</li>
        {/each}
      </ul>
    </div>
    <button
      class="theme-highlight show-details"
      on:click={() => (expanded = false)}>Show Less</button
    >
  {/if}
</div>

<style>
  hr {
    border: 1px solid #e6e7e8;
    margin: 8px 0 12px 0;
    border-bottom-width: 0;
  }

  button {
    font-weight: bold;
    font-size: 13px;
    line-height: 20px;
  }

  .remove-button {
    color: #eb001b;
    font-weight: bold;
    font-size: 13px;
    line-height: 20px;
  }

  .coupon-item-description {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #777777;
    margin-bottom: 8px;
    text-transform: capitalize;
  }

  .tnc-text {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #777777;
  }

  .coupon-item-summary {
    font-weight: bold;
    font-size: 12px;
    line-height: 16px;
    color: #333333;
    margin-bottom: 6px;
    text-transform: capitalize;
  }

  .coupon-item {
    border: 1px solid #e6e7e8;
    padding: 8px 12px;
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

  .success-message {
    margin: 8px 0;
  }

  .success-message p {
    margin-left: 8px;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .text-green {
    color: #079f0d;
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
  }

  ul {
    padding-inline-start: 24px;
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    font-weight: normal;
    font-size: 12px;
    line-height: 24px;
    color: #777777;
  }

  .show-details {
    padding-left: 0;
    font-weight: 500;
  }
</style>
