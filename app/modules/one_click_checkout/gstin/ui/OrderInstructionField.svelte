<script lang="ts">
  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    ORDER_INSTRUCTIONS_LABEL,
    OPTIONAL,
  } from 'one_click_checkout/gstin/i18n/labels';

  // analytics imports
  import { Events } from 'analytics';
  import GSTINEvents from 'one_click_checkout/gstin/analytics';

  // store imports
  import { orderInstruction } from 'one_click_checkout/gstin/store';

  // constants imports
  import {
    ORDER_INSTRUCTION_REGEX_PATTERN,
    ORDER_INSTRUCTION,
  } from 'one_click_checkout/gstin/constants';

  let orderInsField: HTMLElement;
  let showOrderIns = !!$orderInstruction;

  const handleOrderInsToggle = () => {
    Events.TrackBehav(GSTINEvents.ADD_ORDER_INSTRUCTIONS_CLICKED);
    showOrderIns = true;
    Events.TrackRender(GSTINEvents.ORDER_INSTRUCTIONS_FIELD_SHOWN);
  };

  const handleInput = (evt: Event) => {
    const value = (<HTMLInputElement>evt.target)?.value;
    $orderInstruction = value;
  };

  const handleBlur = () => {
    Events.TrackBehav(GSTINEvents.ORDER_INSTRUCTIONS_ENTERED);
  };

  function handleClickLabel() {
    orderInsField.focus();
  }
</script>

{#if showOrderIns || !!$orderInstruction}
  <div class="order-instruction-field">
    <textarea
      class={`order-ins${$orderInstruction ? ' valid' : ''}`}
      name={ORDER_INSTRUCTION}
      type="text"
      id={ORDER_INSTRUCTION}
      pattern={ORDER_INSTRUCTION_REGEX_PATTERN}
      maxlength="255"
      value={$orderInstruction}
      bind:this={orderInsField}
      on:input={handleInput}
      on:blur={handleBlur}
      autofocus
    />
    <label class="order-label" on:click={handleClickLabel}>
      {$t(ORDER_INSTRUCTIONS_LABEL)}
    </label>
  </div>
{:else}
  <span
    on:click={handleOrderInsToggle}
    data-test-id="toggle-order-Ins-cta"
    class="order-instruction-label"
  >
    + {$t(ORDER_INSTRUCTIONS_LABEL)}
    <span class="optional"> {$t(OPTIONAL)} </span>
  </span>
{/if}

<style>
  .order-instruction-field > :global(.elem-one-click-checkout) {
    width: 100%;
  }

  .order-instruction-label {
    display: block;
    margin: 0;
    color: var(--primary-color);
    cursor: pointer;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
  }

  .order-instruction-label .optional {
    color: var(--secondary-text-color);
    font-weight: var(--font-weight-regular);
  }

  .order-ins {
    border: 1px solid var(--light-dark-color);
    padding: 15px 16px;
    border-radius: 4px;
    min-height: 49px;
    height: 49px;
    max-height: 65px;
    box-sizing: border-box;
    width: 100%;
    resize: vertical;
    outline: none;
  }
  .order-instruction-field {
    position: relative;
  }

  .order-ins:focus {
    border: 1px solid var(--primary-color);
  }
  .order-ins:focus + .order-label {
    top: -8px;
    padding: 0 3px;
    font-size: var(--font-size-small);
    left: 9px;
    color: var(--primary-color);
    transition: all ease-out 0.2s;
  }

  .order-ins.valid + .order-label {
    top: -8px;
    padding: 0 3px;
    font-size: var(--font-size-small);
    left: 9px;
  }

  .order-label {
    color: var(--tertiary-text-color);
    position: absolute;
    top: 16px;
    left: 15px;
    cursor: inherit;
    transition: all ease-in 0.2s;
    background: #fff;
    padding: 0px 3px;
  }
</style>
