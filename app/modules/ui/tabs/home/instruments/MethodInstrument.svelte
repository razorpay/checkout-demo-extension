<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import { getSubtextForInstrument } from 'subtext';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { formatTemplateWithLocale } from 'i18n';

  // Store imports
  import {
    selectedInstrumentId,
    methodInstrument,
  } from 'checkoutstore/screens/home';

  // i18n
  import { locale } from 'svelte-i18n';
  import { TITLE_GENERIC } from 'ui/labels/methods';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  const method = instrument.method;

  let methodName;
  $: methodName = getMethodNameForPaymentOption(method, $locale, {
    instrument,
  });

  let title;
  $: title = formatTemplateWithLocale(
    TITLE_GENERIC, // LABEL: Pay using {name}
    { name: methodName },
    $locale
  );

  const id = instrument.id;
  let subtext;
  $: {
    subtext = getSubtextForInstrument(instrument, $locale);
  }

  let icon;
  if (/card$/.test(method)) {
    icon = getThemeMeta().icons['card'];
  } else {
    icon = getThemeMeta().icons[method];
  }
</script>

<SlottedOption
  ellipsis
  {name}
  value={instrument.id}
  radio={false}
  className="instrument"
  attributes={{ 'data-type': 'method' }}
  on:click
>
  <i slot="icon">
    <Icon {icon} alt="" />
  </i>
  <div slot="title">{title}</div>
  <div slot="subtitle">
    {#if subtext}{subtext}{/if}
  </div>
  <div slot="extra"><span class="theme-highlight-color">&#xe604;</span></div>
</SlottedOption>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }
</style>
