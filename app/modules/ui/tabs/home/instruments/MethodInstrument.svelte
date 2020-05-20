<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import { getSubtextForInstrument } from 'subtext';

  // Store imports
  import {
    selectedInstrumentId,
    methodTabInstrument,
  } from 'checkoutstore/screens/home';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  const session = getSession();
  const dispatch = createEventDispatcher();

  const method = instrument.method;
  const methodName = getMethodNameForPaymentOption(method, { instrument });
  const title = `Pay using ${methodName}`;
  const id = instrument.id;
  const subtext = getSubtextForInstrument(instrument);

  let icon;
  if (/card$/.test(method)) {
    icon = session.themeMeta.icons['card'];
  } else {
    icon = session.themeMeta.icons[method];
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }

  function dispatchSelectMethod() {
    dispatch('selectMethod', {
      method: instrument.method,
    });
  }

  function setMethodInstrument() {
    $methodTabInstrument = instrument;
  }
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
  attributes={{ 'data-type': 'method' }}
  on:click
  on:click={deselectInstrument}
  on:click={setMethodInstrument}
  on:click={dispatchSelectMethod}>
  <i slot="icon">
    <Icon {icon} alt={methodName} />
  </i>
  <div slot="title">{title}</div>
  <div slot="subtitle">
    {#if subtext}{subtext}{/if}
  </div>
  <div slot="extra">
    <span class="theme-highlight-color">&#xe604;</span>
  </div>
</SlottedOption>
