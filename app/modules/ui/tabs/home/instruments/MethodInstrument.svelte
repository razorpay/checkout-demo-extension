<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import { getSubtextForInstrument } from 'subtext';
  import { formatTemplateWithLocale } from 'i18n';

  // Store imports
  import {
    selectedInstrumentId,
    methodTabInstrument,
  } from 'checkoutstore/screens/home';

  import { locale } from 'svelte-i18n';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  const session = getSession();

  const method = instrument.method;

  let methodName;
  $: methodName = getMethodNameForPaymentOption(method, $locale, {
    instrument,
  });

  let title;
  $: title = formatTemplateWithLocale(
    'methods.titles.generic',
    { name: methodName },
    $locale
  );

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

  function switchToMethod() {
    let method = instrument.method;

    if (method === 'paypal') {
      createPaypalPayment();
      return;
    } else if (method === 'gpay') {
      method = 'upi';
    }

    session.switchTab(method);
  }

  function createPaypalPayment() {
    const payload = session.getPayload();

    payload.method = 'paypal';

    session.preSubmit(null, payload);
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
  on:click={switchToMethod}>
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
