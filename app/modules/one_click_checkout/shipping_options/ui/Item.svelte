<script lang="ts">
  import { t } from 'svelte-i18n';
  import Stack from 'ui/layouts/Stack.svelte';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency } from 'razorpay';
  import { FREE_LABEL } from 'summary_modal/i18n/labels';
  import type { ShippingMethod } from '../types/interface';

  export let option: ShippingMethod;
  export let checked = false;
  export let group: string;
  export let fullWidth = false;

  const currency = getCurrency();
</script>

<div
  id={`shipping-radio-${option.id}`}
  class="shipping-radio"
  class:bordered={fullWidth}
  class:selected={checked}
>
  <input
    id={option.id}
    type="radio"
    bind:group
    name="options"
    value={option.id}
  />
  <label for={option.id} class:top-align={!option.description}>
    <Stack vertical>
      <span class="name"
        >{option.name} | {option.shipping_fee
          ? formatAmountWithSymbol(option.shipping_fee, currency, false)
          : $t(FREE_LABEL)}</span
      >
      {#if option.description}
        <span class="desc">{option.description}</span>
      {/if}
    </Stack>
  </label>
</div>

<style lang="scss">
  input[type='radio'] {
    display: inline-block;
    height: 14px;
    width: 14px;
    border: 2px solid #757575;
    border-radius: 50%;
    margin: 0;
    appearance: none;
    outline: none;
    background-clip: content-box;
    box-sizing: content-box;
  }
  input[type='radio']::before {
    content: '';
    display: block;
    width: 70%;
    height: 70%;
    margin: 15% auto;
    border-radius: 50%;
  }
  input[type='radio']:checked::before {
    background-color: var(--primary-color);
  }
  input[type='radio']:checked {
    border-color: var(--primary-color);
  }
  input[type='radio']:checked + label {
    background: none;
  }
  .shipping-radio {
    flex-direction: row;
    align-items: center;
    margin-left: 8px;

    &.bordered {
      border: 1px solid var(--light-dark-color);
      padding: 10px;
      border-radius: 4px;
      margin-left: 0;

      &.selected {
        border-color: var(--primary-color);
        background-color: var(--hover-state-color);
      }

      input[type='radio'] + label {
        width: calc(100% - 26px);
      }
    }

    .name {
      font-weight: var(--font-weight-medium);
      color: var(--secondary-text-color);
    }
    .desc {
      font-size: var(--font-size-small);
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
  }
  input[type='radio'] + label {
    vertical-align: middle;
    display: inline-flex;
    margin-left: 4px;

    &.top-align {
      vertical-align: top;
    }
  }
</style>
