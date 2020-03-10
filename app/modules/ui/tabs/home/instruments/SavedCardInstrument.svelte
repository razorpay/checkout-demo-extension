<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { findCodeByNetworkName } from 'common/card';
  import { getSession } from 'sessionmanager';
  import PreferencesStore from 'checkoutstore/preferences';
  import { getIcon as getNetworkIcon } from 'icons/network';
  import Track from 'tracker';

  // Store
  import { contact } from 'checkoutstore/screens/home';

  // Props
  export let instrument = {}; // P13n instrument
  export let selected = false; // Whether or not this instrument is selected
  export let name = 'instrument';

  const session = getSession();
  const customer = session.getCustomer($contact);

  const id = Track.makeUid();

  function getBankText(card, loggedIn) {
    const banks = PreferencesStore.get().methods.netbanking;
    const bank = banks[card.issuer] || '';
    const bankText = bank.replace(/ Bank$/, '');

    if (loggedIn) {
      return `${bank ? `${bankText} ` : ''}${_Str.toTitleCase(
        card.card_type || ''
      )} card - ${card.last4}`;
    } else {
      return `Use your${bank ? ` ${bankText}` : ''} ${_Str.toTitleCase(
        card.card_type || ''
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

  let title;
  let icon;
  let hasCvv = false;
  let cvvLength = 3;
  let cardKnown = false;

  const savedCards = _Obj.getSafely(customer, 'tokens.items', []);
  const savedCard = _Arr.find(
    savedCards,
    card => card.id === instrument.token_id
  );

  if (savedCard) {
    // User is logged in
    const card = savedCard.card || {};
    const networkCode = findCodeByNetworkName(card.network);

    title = getBankText(card, true);
    icon = getIcon(card);

    cvvLength = networkCode === 'amex' ? 4 : 3;
    hasCvv = true;

    cardKnown = true;
  } else {
    // User is logged out.

    if (instrument.issuer) {
      // We know stuff about the card.
      title = getBankText(instrument, false);
      icon = getIcon(instrument);
      hasCvv = false;
    } else {
      // We don't know anything about the card.
      title = 'Use your saved cards';
      icon = getIcon();
      hasCvv = false;
    }
  }

  const component = cardKnown ? SlottedRadioOption : SlottedOption;
</script>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }

  div[slot='extra'] :global(.elem .input) {
    padding: 0;
    width: 2rem;
  }
</style>

<svelte:component
  this={component}
  {name}
  {selected}
  ellipsis
  value={id}
  radio={false}
  className="instrument"
  on:click>
  <i slot="icon">
    <Icon {icon} alt="Card" />
  </i>
  <div slot="title">{title}</div>

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
</svelte:component>
