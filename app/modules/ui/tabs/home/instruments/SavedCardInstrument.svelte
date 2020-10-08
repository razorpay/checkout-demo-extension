<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { findCodeByNetworkName } from 'common/card';
  import { getSession } from 'sessionmanager';
  import { getBanks } from 'checkoutstore';
  import { getIcon as getNetworkIcon } from 'icons/network';
  import Track from 'tracker';
  import { getExtendedSingleInstrument } from 'configurability/instruments';

  // Store
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { customer } from 'checkoutstore/customer';

  // i18n
  import {
    getLongBankName,
    formatTemplateWithLocale,
    formatMessageWithLocale,
    getInstrumentTitle,
  } from 'i18n';

  import { locale } from 'svelte-i18n';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  let individualInstrument = getExtendedSingleInstrument(instrument);
  $: individualInstrument = getExtendedSingleInstrument(instrument);

  const session = getSession();
  const isEmiInstrument = instrument.method === 'emi';

  function getBankText(card, loggedIn) {
    const banks = getBanks() || {};

    const bank = banks[card.issuer]
      ? getLongBankName(card.issuer, $locale)
      : '';

    const bankText = bank.replace(/ Bank$/, '');

    const cardType = card.type || '';

    if (loggedIn) {
      return formatTemplateWithLocale(
        isEmiInstrument
          ? 'instruments.titles.emi_logged_in'
          : 'instruments.titles.card_logged_in',
        {
          bank: bankText,
          type: _Str.toTitleCase(cardType),
          last4: card.last4,
        },
        $locale
      );
    } else {
      return formatTemplateWithLocale(
        isEmiInstrument
          ? 'instruments.titles.emi_logged_out'
          : 'instruments.titles.card_logged_out',
        {
          bank: bankText,
          type: _Str.toTitleCase(cardType),
        },
        $locale
      );
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

  const savedCards = _Obj.getSafely($customer, 'tokens.items', []);
  const savedCard = _Arr.find(
    savedCards,
    card => card.id === individualInstrument.token_id
  );

  if (savedCard) {
    // User is logged in
    const card = savedCard.card || {};
    const networkCode = findCodeByNetworkName(card.network);

    title = getBankText(card, true);
    icon = getIcon(card);

    cvvLength = networkCode === 'amex' ? 4 : 3;

    // EMI instruments don't have CVV
    hasCvv = instrument.method === 'card';

    cardKnown = true;
  } else {
    // User is logged out.

    if (individualInstrument.issuer) {
      // We know stuff about the card.
      title = getBankText(individualInstrument, false);
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

  function selectionHandler() {
    if (hasCvv) {
      setTimeout(() => {
        // Focus on the input field
        const instrumentInDom = _El.closest(
          _Doc.querySelector(`.home-methods input[value="${instrument.id}"]`),
          '.instrument'
        );
        const cvvInput = instrumentInDom.querySelector('.cvv-input');

        if (cvvInput) {
          cvvInput.focus();
        }
      });
    } else {
      // TODO: Someday, preselect the saved card in the saved cards list.

      session.switchTab(instrument.method);
    }
  }
</script>

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
</style>

<svelte:component
  this={component}
  ellipsis
  {name}
  {selected}
  className="instrument"
  radio={false}
  value={instrument.id}
  on:click={selectionHandler}
  on:click>
  <i slot="icon">
    <Icon {icon} alt="" />
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
    {:else}<span class="theme-highlight-color">&#xe604;</span>{/if}
  </div>
</svelte:component>
