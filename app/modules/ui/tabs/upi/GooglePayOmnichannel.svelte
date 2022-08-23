<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  import { _ as t } from 'svelte-i18n';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { getAnimationOptions } from 'svelte-utils';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';

  import {
    OMNI_BLOCK_HEADING,
    OMNI_GPAY_NUMBER,
    OMNI_ENTER_NUMBER,
    OMNI_ERROR,
    OMNI_GPAY,
    OMNI_GPAY_SUBTITLE,
  } from 'ui/labels/upi';
  import { isRedesignV15 } from 'razorpay';

  // Props
  export let selected = true;
  export let error = false;
  export let isFirst = true;
  export let contact = '';
  export let focusOnCreate = false;
  export let value = '';

  // Refs
  export let phoneField = null;

  const dispatch = createEventDispatcher();
  const session = getSession();

  const isRedesignV15Enabled = isRedesignV15();

  // Computed
  const onSelection = () => {
    const customer = session.getCurrentCustomer() || {};

    contact = customer.contact ? customer.contact.replace('+91', '') : '';

    if (focusOnCreate) {
      focus();
    }
  };

  export function handleCardClick(event) {
    signalSelect();
    focus();
  }

  export function signalSelect() {
    dispatch('select', {
      type: 'phone',
    });
  }

  export function focus() {
    signalSelect();
    //TODO check if there is a better way
    setTimeout(() => {
      if (phoneField) {
        phoneField.focus();
      }
    }, 0);
    dispatch('focus');
  }

  export function blur(event) {
    phoneField.blur();
    dispatch('blur', event.detail);
  }

  // TODO trigger shake on invalid phone number
  const pattern = '[0-9]{10}';
</script>

<!-- LABEL: Or, pay using phone number -->
<div class="legend left">{$t(OMNI_BLOCK_HEADING)}</div>

<SlottedRadioOption
  name="payment_type"
  value="full"
  align="top"
  on:click={onSelection}
  {selected}
>
  <!-- LABEL: Google Pay phone number -->
  <div id="gpay-omnichannel" slot="title">
    {$t(isRedesignV15Enabled ? OMNI_GPAY : OMNI_GPAY_NUMBER)}
  </div>
  <div id="gpay-omnichannel-subtitle" slot="subtitle">
    {$t(OMNI_GPAY_SUBTITLE)}
  </div>
  <i slot="icon" class="top">
    <img src="https://cdn.razorpay.com/app/googlepay.svg" alt="" />
  </i>

  <div slot="body">
    {#if selected}
      <div transition:slide={getAnimationOptions({ duration: 200 })}>
        <!-- LABEL: Enter your phone numbe -->
        <Field
          formatter={{ type: 'number' }}
          elemClasses="mature"
          id="gpay-phone"
          {pattern}
          name="phone"
          type="text"
          required
          bind:this={phoneField}
          on:blur
          value={contact}
          bind:readonlyValue={value}
          placeholder={$t(OMNI_ENTER_NUMBER)}
          label={isRedesignV15Enabled ? 'Enter Number' : ''}
        />
      </div>
    {/if}
  </div>
</SlottedRadioOption>

{#if selected}
  {#if error}
    <!-- LABEL: Please ensure the same number is linked to the Google Pay account. -->
    <p class:regular={!isFirst} class:error={isFirst}>{$t(OMNI_ERROR)}</p>
  {/if}
{/if}

<style>
  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }

  .error {
    font-size: 12px;
    margin-top: 18px;
    color: red;
  }
  [slot='icon'].top {
    align-self: flex-start;
  }

  :global(#gpay-omnichannel-subtitle) {
    display: none;
  }

  :global(.redesign #gpay-omnichannel-subtitle) {
    display: block;
    margin-bottom: 10px;
    font-size: 12px;
    margin-top: 2px;
  }
</style>
