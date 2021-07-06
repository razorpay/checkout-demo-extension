<script>
  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getExtendedSingleInstrument } from 'configurability/instruments';
  import {
    getUPIAppDataFromHandle,
  } from 'common/upi';

  // i18n
  import { locale } from 'svelte-i18n';
  import {
    getInstrumentTitle,
  } from 'i18n';
  
  // Props
  export let instrument = {};
  export let name = 'instrument';


  let title;
  let icon;
  let code;

  let individualInstrument = getExtendedSingleInstrument(instrument);
  $: individualInstrument = getExtendedSingleInstrument(instrument);

  function getDetailsForInstrument(instrument, locale) {
    let title, icon;

    const app = getUPIAppDataFromHandle(instrument.vendor_vpa?.slice(1));

    let appName = app.app_name || 'Unknown app';

    title = getInstrumentTitle('upi', appName.replace(/ UPI$/, ''), locale);

    if (app.app_icon) {
      icon = app.app_icon;
    } else {
      icon = '&#xe70e;';
    }

    return {
      title,
      icon,
    };
  }

  $: {
    const details = getDetailsForInstrument(individualInstrument, $locale);
    if (details) {
      title = details.title;
      icon = details.icon;
      code = details.code;
    }
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
  <i slot="icon" class="upi-app-icon-slot">
    <Icon {icon} alt="" />
  </i>
  <div slot="title">{title}</div>
  <div slot="extra"><span class="theme-highlight-color">&#xe604;</span></div>
</SlottedOption>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }
</style>
