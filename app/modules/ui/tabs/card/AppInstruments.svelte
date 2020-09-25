<script>
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // Store
  import { proxyCountry, proxyPhone } from 'checkoutstore/screens/home';

  // UI Imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import ContactField from 'ui/components/ContactField.svelte';

  // Util imports
  import { isContactOptional, getCustomSubtextForMethod } from 'checkoutstore';
  import { isContactRequiredForAppProvider } from 'checkoutstore/methods';
  import { getProvider as getAppProvider } from 'common/apps';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getAppProviderName, getAppProviderSubtext } from 'i18n';

  const dispatch = createEventDispatcher();

  export let apps = [];
  export let selectedApp;

  function select(code) {
    dispatch('select', code);
  }

  function isContactRequired(provider) {
    return isContactOptional() && isContactRequiredForAppProvider(provider);
  }

  function getSubtext(provider) {
    const customSubtext = getCustomSubtextForMethod(provider);
    if (customSubtext) {
      return customSubtext;
    }
    return getAppProviderSubtext(provider, $locale);
  }
</script>

{#each apps as app}
  <SlottedRadioOption
    ellipsis
    name={app.name}
    selected={selectedApp === app.code}
    className="instrument"
    value={app.code}
    expandable={selectedApp && isContactRequired(app.code)}
    on:click={_ => select(app.code)}>
    <i slot="icon">
      <Icon icon={app.logo} alt="" />
    </i>
    <div slot="title">{getAppProviderName(app.code, $locale)}</div>
    <div slot="subtitle">
      {#if getSubtext(app.code)}{getSubtext(app.code)}{/if}
    </div>
    <div slot="body">
      {#if selectedApp && isContactRequired(app.code)}
        <ContactField bind:country={$proxyCountry} bind:phone={$proxyPhone} />
      {/if}
    </div>
  </SlottedRadioOption>
{/each}
