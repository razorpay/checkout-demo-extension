<script>
  // UI imports
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import SecureCard from 'ui/tabs/card/SecureCard.svelte';
  // Utils imports
  import { findCodeByNetworkName } from 'common/card';
  import { getSession } from 'sessionmanager';
  import {
    getBankText,
    addConsentDetailsToInstrument,
  } from 'ui/tabs/home/helpers';
  import { getIcon as getNetworkIcon } from 'icons/network';
  import { getExtendedSingleInstrument } from 'configurability/instruments';
  import { isCardTokenized } from 'ui/tabs/card/utils.js';
  // Store
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { userConsentForTokenization } from 'checkoutstore/screens/card';
  import { customer } from 'checkoutstore/customer';

  import { setDynamicFeeObject } from 'checkoutstore/dynamicfee';
  import { isDynamicFeeBearer } from 'razorpay';

  // i18n
  import { getInstrumentTitle } from 'i18n';

  import { locale } from 'svelte-i18n';

  import { selectedCardFromHome } from 'checkoutstore/screens/card';
  import { querySelector } from 'utils/doc';
  // Props
  export let instrument = {};
  export let name = 'instrument';
  let downtimeSeverity;
  let downtimeInstrument = '';
  let cvvRef;
  let collectCardTokenisationConsent = false;

  let individualInstrument = getExtendedSingleInstrument(instrument);
  $: individualInstrument = getExtendedSingleInstrument(instrument);

  const session = getSession();
  const isEmiInstrument = instrument.method === 'emi';

  function getIcon(card) {
    if (card && card.network && card.network !== 'unknown') {
      return getNetworkIcon(findCodeByNetworkName(card.network));
    } else {
      return session.themeMeta.icons.card;
    }
  }

  let title;
  let icon;
  let isTokenised;
  let hasCvv = false;
  let cvvLength = 3;
  let cardKnown = false;

  const savedCards = _Obj.getSafely($customer, 'tokens.items', []);
  const savedCard = savedCards.find(
    (card) => card.id === individualInstrument.token_id
  );

  if (savedCard) {
    // User is logged in
    const card = savedCard.card || {};
    const networkCode = findCodeByNetworkName(card.network);
    isTokenised = isCardTokenized(savedCard);
    addConsentDetailsToInstrument(instrument, savedCard);
    title = getBankText(card, true, isEmiInstrument, $locale);
    icon = getIcon(card);

    cvvLength = networkCode === 'amex' ? 4 : 3;

    // EMI instruments don't have CVV
    hasCvv = instrument.method === 'card';

    cardKnown = true;
  } else {
    // User is logged out.

    if (individualInstrument.issuer) {
      // We know stuff about the card.
      title = getBankText(
        individualInstrument,
        false,
        isEmiInstrument,
        $locale
      );
      icon = getIcon(individualInstrument);
      hasCvv = false;
    } else {
      // We don't know anything about the card.
      const method = isEmiInstrument ? 'emi_saved_cards' : 'saved_cards';
      title = getInstrumentTitle(method, '', $locale);
      icon = getIcon();
      hasCvv = false;
    }
  }

  const component = cardKnown ? SlottedRadioOption : SlottedOption;

  let selected = false;
  $: selected = cardKnown && $selectedInstrumentId === instrument.id;

  $: {
    if (selected) {
      downtimeSeverity = instrument.downtimeSeverity;
      downtimeInstrument = instrument.downtimeInstrument;
    } else {
      downtimeSeverity = false;
    }
  }
  $: collectCardTokenisationConsent = selected && !isTokenised;

  function selectionHandler() {
    if (isDynamicFeeBearer()) {
      setDynamicFeeObject('card', savedCard?.card?.type);
    }
    if (savedCard) {
      // FOR AVS we are need card details
      $selectedCardFromHome = savedCard;
    }
    if (hasCvv) {
      setTimeout(() => {
        // Focus on the input field
        const instrumentInDom = _El.closest(
          querySelector(`.home-methods input[value="${instrument.id}"]`),
          '.instrument'
        );
        const cvvInput = instrumentInDom.querySelector('.cvv-input');

        if (cvvInput) {
          cvvInput.focus();
        }
      });
    } else {
      // TODO: Someday, preselect the saved card in the saved cards list.
      session.switchTab(instrument.method, {
        preferred: instrument?.meta?.preferred,
      });
    }
  }
</script>

<svelte:component
  this={component}
  ellipsis
  {name}
  {selected}
  className="instrument"
  radio={false}
  value={instrument.id}
  on:click={selectionHandler}
  on:click
>
  <i slot="icon">
    <Icon {icon} alt="" />
  </i>
  <div slot="title">
    <span class="card-title"> {title} </span>&nbsp;
    {#if isTokenised === false}
      <span class="card-title card-non-tokenised"> * </span>
    {/if}
  </div>

  <div slot="extra" class="slots-extra">
    {#if !!downtimeSeverity}
      <div class="downtime-saved-card-icon">
        <DowntimeIcon severe={downtimeSeverity} />
      </div>
    {/if}
    {#if hasCvv}
      <Field
        type="cvv"
        name="cvv"
        placeholder="CVV"
        maxlength={cvvLength}
        required={true}
        tabindex={-1}
        formatter={{ type: 'number' }}
        bind:this={cvvRef}
        handleBlur={true}
      />
    {:else}<span class="theme-highlight-color">&#xe604;</span>{/if}
  </div>

  <div slot="secure-card">
    {#if collectCardTokenisationConsent}
      <SecureCard
        bind:checked={$userConsentForTokenization}
        modalType="p13n-existing-card"
        {cvvRef}
        network={savedCard?.card?.network}
      />
    {/if}
  </div>
  <div slot="downtime" class="downtime-saved-card">
    {#if !!downtimeSeverity}
      <DowntimeCallout
        showIcon={false}
        severe={downtimeSeverity}
        {downtimeInstrument}
      />
    {/if}
  </div>
</svelte:component>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }

  div[slot='extra'] :global(.elem .input) {
    padding: 0;
    width: 40px;
    letter-spacing: -3px;
    font-family: rzpcvv;
  }
  .downtime-saved-card {
    margin-top: 4px;
  }
  .downtime-saved-card-icon {
    margin-right: 8px;
  }
  .slots-extra {
    display: flex;
  }

  .card-title {
    transform: none;
  }

  .card-non-tokenised {
    color: red;
    font-size: 16px;
    font-weight: 500;
  }
</style>
