<script lang="ts">
  import { userConsentForTokenization } from 'checkoutstore/screens/card';
  import { getShortBankName } from 'i18n';
  import { isRedesignV15 } from 'razorpay';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { locale } from 'svelte-i18n';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';
  import SecureCard from 'ui/tabs/card/SecureCard.svelte';
  import type { Card } from 'emiV2/types';
  import NoCostLabel from 'components/Label/NoCostLabel.svelte';
  import StartingFromLabel from 'components/Label/StartingFromLabel.svelte';

  export let card: Card = {};
  export let selected: boolean;
  export let isTokenised: boolean;
  export let showCVV: boolean;
  export let cvvDigits: number;

  let cvvValue = '';

  let cvvInput;

  const isRedesignV15Enabled: boolean = isRedesignV15();

  const dispatch = createEventDispatcher();

  const handleCardSelect = () => {
    dispatch('select', {});
  };

  onMount(() => {
    tick().then(() => {
      if (cvvInput && showCVV) {
        cvvInput.focus();
      }
    });
  });
</script>

<div
  class:cvv-input={showCVV}
  class:selected
  class="saved-card-item"
  on:click={() => {
    handleCardSelect();
  }}
>
  <div class="cardtype" cardtype={card.networkCode} />
  <div class="saved-card-info">
    <p>
      {getShortBankName(card.cobranding_partner || card.issuer, $locale)}
      <span class="card-type">{card.type} Card</span>
      - {card.last4}
      {#if !isTokenised}<span class="card-non-tokenised"> * </span> {/if}
    </p>
    {#if showCVV}
      <div class="saved-cvv" class:saved-card-one-cc={isRedesignV15Enabled}>
        <CvvField
          bind:value={cvvValue}
          length={cvvDigits}
          on:input={() => {
            dispatch('cvvchange', { cvv: cvvValue });
          }}
          bind:this={cvvInput}
          on:blur={() => {
            dispatch('cvvblur');
          }}
          showHelp={false}
          showPlaceholder={!isRedesignV15Enabled}
          elemClasses={isRedesignV15Enabled && 'cvv-one-cc-wrapper'}
          inputFieldClasses={isRedesignV15Enabled && 'cvv-one-cc'}
          labelClasses={isRedesignV15Enabled && 'cvv-one-cc-label'}
          labelUpperClasses={isRedesignV15Enabled && 'cvv-one-cc-label-upper'}
        />
      </div>
    {:else if card.isNoCostEMI}
      <NoCostLabel />
    {:else if card.startingFrom}
      <StartingFromLabel startingAt={card.startingFrom} />
    {/if}
  </div>
</div>
{#if !isTokenised && showCVV}
  <div class="saved-cards-tokenisation-consent">
    <SecureCard
      bind:checked={$userConsentForTokenization}
      savedcard
      modalType="existing-card"
      network={card.network}
    />
  </div>
{/if}

<style>
  .cardtype {
    width: 36px;
    height: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border: 1px solid rgba(121, 116, 126, 0.16);
    box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.04);
  }
  .saved-card-item {
    padding: 16px 8px;
    border: 1px solid #ebedf0;
    background: #fff;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .saved-card-item:not(:last-child) {
    border-bottom: none;
  }
  .saved-card-item.cvv-input {
    border: none;
    padding: 0;
    padding: 16px 0px;
  }
  .saved-card-info {
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 82%;
  }
  .saved-card-info p {
    font-size: 10px;
    font-weight: 600;
    color: #263a4a;
    margin: 0;
  }

  .saved-card-item.cvv-input .saved-card-info p {
    font-size: 13px;
  }
  .card-type {
    text-transform: capitalize;
  }
  .cardtype::before {
    margin: 0;
  }
  .saved-card-item.selected {
    border: 1px solid var(--highlight-color);
  }
  .card-non-tokenised {
    color: red;
    font-size: 12px;
    font-weight: 500;
    margin-left: 2px;
  }
  .saved-cvv {
    font-size: 12px;
    padding: 5px;
    width: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  :global(.saved-cvv .elem input) {
    padding: 0 0 4px 0;
    letter-spacing: -3px;
  }

  .saved-card-one-cc {
    width: 60px;
    padding: 0px 0px;
  }
</style>
