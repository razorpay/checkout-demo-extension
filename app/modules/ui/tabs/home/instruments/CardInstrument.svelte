<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Track from 'tracker';
  import { toTitleCase } from 'lib/utils';
  import { getBanks } from 'checkoutstore';

  // Store imports
  import {
    selectedInstrumentId,
    methodTabInstruments,
  } from 'checkoutstore/screens/home';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  const session = getSession();
  const icon = session.themeMeta.icons['card'];

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }

  function showCards() {
    session.switchTab(instrument.method);
  }

  function setMethodInstruments() {
    $methodTabInstruments = [instrument];
  }

  function getBankName(issuer) {
    const banks = getBanks();
    const bank = banks[issuer] || '';
    const bankName = bank.replace(/ Bank$/, '');

    return bankName;
  }

  const cardTypeString = _Arr.map(instrument.types || [], toTitleCase);
  const issuerString = _Arr.filter(
    _Arr.map(instrument.issuers || [], getBankName),
    Boolean
  );

  const title = _Arr
    .filter(
      [
        'Pay using',
        issuerString.length ? issuerString : cardTypeString,
        'Card',
      ],
      Boolean
    )
    .join(' ');
</script>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }
</style>

<SlottedOption
  ellipsis
  {name}
  value={instrument.id}
  radio={false}
  className="instrument"
  on:click
  on:click={deselectInstrument}
  on:click={setMethodInstruments}
  on:click={showCards}>
  <i slot="icon">
    <Icon {icon} alt="Card" />
  </i>
  <div slot="title">{title}</div>

  <div slot="extra">
    <span class="theme-highlight-color">&#xe604;</span>
  </div>
</SlottedOption>
