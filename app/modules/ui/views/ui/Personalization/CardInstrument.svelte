<script>
  // UI imports
  import Field from 'templates/views/ui/Field.svelte';
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';

  // Utils imports
  import { findCodeByNetworkName } from 'common/card';
  import { getSession } from 'sessionmanager';
  import PreferencesStore from 'checkoutstore/preferences';
  import { getIcon as getNetworkIcon } from 'icons/network';

  // Props
  export let instrument = {}; // P13n instrument
  export let name; // Name of the input
  export let customer = {}; // Current customer
  export let selected = false; // Whether or not this instrument is selected

  const session = getSession();

  function getBankText(card, loggedIn) {
    const banks = PreferencesStore.get().methods.netbanking;
    const bank = banks[card.issuer] || '';
    const bankText = bank.replace(/ Bank$/, '');

    if (loggedIn) {
      return `${bank ? `${bankText} ` : ''}${_Str.toTitleCase(
        card.type || ''
      )} card - ${card.last4}`;
    } else {
      return `Use your${bank ? ` ${bankText}` : ''} ${_Str.toTitleCase(
        card.type || ''
      )} card`;
    }
  }

  function getIcon(card) {
    if (card && card.network && card.network !== 'unknown') {
      return getNetworkIcon(findCodeByNetworkName(card.network));
    } else {
      return session.themeMeta.icons.card;
    }
  }

  let text;
  let icon;
  let hasCvv = false;
  let cvvLength = 3;
  let savedCards;

  $: savedCards = _Obj.getSafely(customer, 'tokens.items', []);
  $: savedCard = _Arr.find(savedCards, card => card.id === instrument.token_id);
  $: {
    if (customer) {
      // We don't know anytihng about the card. User is logged out.
      if (!savedCard && !instrument.issuer) {
        text = 'Use your saved cards';
        icon = '&#xe715;';
        hasCvv = false;
      }
      // We know stuff about the card. User is logged out.
      else if (!savedCard && instrument.issuer) {
        text = getBankText(instrument, false);
        icon = getIcon(instrument);
        hasCvv = false;
      }
      // User is logged in
      else {
        const card = savedCard.card || {};
        const networkCode = findCodeByNetworkName(card.network);

        text = getBankText(card, true);
        icon = getIcon(card);

        cvvLength = networkCode === 'amex' ? 4 : 3;
        hasCvv = true;
      }
    } else {
      text = `Use your saved cards`;
      icon = getIcon();
      hasCvv = false;
    }
  }
</script>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }

  div[slot='extra'] {
    :global(.elem .input) {
      padding: 0;
      width: 2rem;
    }
  }
</style>

<SlottedRadioOption
  {name}
  {selected}
  ellipsis
  value={instrument.id}
  radio={false}
  className="p13n-instrument"
  on:click>
  <i slot="icon">
    <Icon {icon} alt="Card" />
  </i>
  <div slot="title">{text}</div>

  <div slot="extra">
    {#if hasCvv}
      <Field
        type="cvv"
        name="cvv"
        placeholder="CVV"
        maxlength={cvvLength}
        required={true}
        tabindex={-1}
        formatter={{ type: 'number' }} />
    {:else}
      <span class="theme-highlight-color">&#xe604;</span>
    {/if}
  </div>
</SlottedRadioOption>
