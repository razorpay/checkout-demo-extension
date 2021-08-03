<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // Store
  import { proxyCountry, proxyPhone } from 'checkoutstore/screens/home';

  // UI Imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import ContactField from 'ui/components/ContactField.svelte';

  // Util imports
  import { isContactOptional } from 'checkoutstore';
  import { isContactRequiredForAppProvider } from 'checkoutstore/methods';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getAppProviderName } from 'i18n';

  import { getAppInstrumentSubtext } from 'ui/tabs/card/utils';
  import type { AppInstrument } from 'types';
  const dispatch = createEventDispatcher();

  export let apps: AppInstrument[] = [];
  export let selectedApp: string;

  function select(code: string) {
    dispatch('select', code);
  }

  function isContactRequired(provider: string) {
    return isContactOptional() && isContactRequiredForAppProvider(provider);
  }
</script>

{#each apps as app}
  <SlottedRadioOption
    ellipsis
    name={app.name}
    selected={selectedApp === app.code}
    className="instrument"
    value={app.code}
    on:click={(_) => select(app.code)}
  >
    <i slot="icon">
      <Icon icon={app.logo} alt="" />
    </i>
    <div slot="title">{getAppProviderName(app.code, $locale)}</div>
    <div slot="subtitle">
      {#if getAppInstrumentSubtext(app.code, $locale)}{getAppInstrumentSubtext(
          app.code,
          $locale
        )}{/if}
    </div>
    <div slot="body">
      {#if selectedApp && isContactRequired(app.code)}
        <ContactField bind:country={$proxyCountry} bind:phone={$proxyPhone} />
      {/if}
    </div>
  </SlottedRadioOption>
{/each}
