<script>
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // Store
  import { proxyCountry, proxyPhone } from 'checkoutstore/screens/home';

  // UI Imports
  import AppInstrument from 'ui/tabs/card/AppInstrument.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import ContactField from 'ui/components/ContactField.svelte';

  // Util imports
  import { isContactOptional } from 'checkoutstore';
  import { isContactRequiredForAppProvider } from 'checkoutstore/methods';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getAppProviderName } from 'i18n';

  import { getAppInstrumentSubtext } from 'ui/tabs/card/utils';
  const dispatch = createEventDispatcher();

  export let apps = [];
  export let selectedApp;

  function select(code) {
    dispatch('select', code);
  }

  function isContactRequired(provider) {
    return isContactOptional() && isContactRequiredForAppProvider(provider);
  }
</script>

{#each apps as app}
  <AppInstrument
    selected={selectedApp === app.code}
    value={app.code}
    on:click={(_) => select(app.code)}
  >
    <i slot="icon" id="app-card" type={app.code}>
      <Icon icon={app.card_logo || app.logo} alt="" />
    </i>
    <div slot="title" id="app-title">
      {getAppProviderName(app.code, $locale)}
    </div>
    <div slot="subtitle" id="app-subtitle">
      {#if getAppInstrumentSubtext(app.code, $locale)}{getAppInstrumentSubtext(
          app.code,
          $locale
        )}{/if}
    </div>
    <div slot="body">
      {#if selectedApp && isContactRequired(app.code)}
        <div class="line" />
        <ContactField bind:country={$proxyCountry} bind:phone={$proxyPhone} />
      {/if}
    </div>
  </AppInstrument>
{/each}

<style>
  #app-title {
    font-size: 14px;
  }

  #app-subtitle {
    font-size: 12px;
    line-height: 0.8rem;
    margin-top: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0px;
  }

  .line {
    margin-top: 12px;
    height: 0px;
    border: 1px solid rgba(230, 231, 232, 0.58);
  }
</style>
