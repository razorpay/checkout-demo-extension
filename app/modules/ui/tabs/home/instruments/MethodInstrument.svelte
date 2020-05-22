<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import { getSubtextForInstrument } from 'subtext';
  import { getThemeMeta } from 'checkoutstore/theme';

  // Store imports
  import {
    selectedInstrumentId,
    methodInstrument,
  } from 'checkoutstore/screens/home';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  const method = instrument.method;
  const methodName = getMethodNameForPaymentOption(method, { instrument });
  const title = `Pay using ${methodName}`;
  const id = instrument.id;
  const subtext = getSubtextForInstrument(instrument);

  let icon;
  if (/card$/.test(method)) {
    icon = getThemeMeta().icons['card'];
  } else {
    icon = getThemeMeta().icons[method];
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
  on:click>
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
