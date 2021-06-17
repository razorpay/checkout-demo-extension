<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';

  // Store
  import { proxyCountry, proxyPhone } from 'checkoutstore/screens/home';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getBankLogo } from 'common/bank';
  import { getBanks, isContactOptional } from 'checkoutstore';
  import { getWallet } from 'common/wallet';
  import { getProvider as getCardlessEmiProvider } from 'common/cardlessemi';
  import { getProvider as getPaylaterProvider } from 'common/paylater';
  import { getProvider as getAppProvider } from 'common/apps';
  import { getExtendedSingleInstrument } from 'configurability/instruments';
  import { getAppInstrumentSubtext } from 'ui/tabs/card/utils';

  // Store
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { customer } from 'checkoutstore/customer';
  import {
    isDebitEMIEnabled,
    isContactRequiredForInstrument,
  } from 'checkoutstore/methods';
  import { getUPIIntentApps } from 'checkoutstore/native';

  // i18n
  import { locale } from 'svelte-i18n';
  import {
    getInstrumentTitle,
    getLongBankName,
    getWalletName,
    getCardlessEmiProviderName,
    getPaylaterProviderName,
    getUpiIntentAppName,
    getAppProviderName,
  } from 'i18n';

  // Props
  export let instrument = {};
  export let name = 'instrument';
  let downtimeSeverity;
  let downtimeInstrument = '';

  let individualInstrument = getExtendedSingleInstrument(instrument);
  $: individualInstrument = getExtendedSingleInstrument(instrument);

  let selected = false;
  $: selected = $selectedInstrumentId === instrument.id;

  let contactRequired =
    isContactRequiredForInstrument(instrument) && isContactOptional();

  const session = getSession();
  const dispatch = createEventDispatcher();

  let title;
  let icon;
  let code;
  let subtitle;
  function getVpaFromInstrument(instrument) {
    const { vpa, token } = instrument;

    if (vpa) {
      return vpa;
    }

    const tokens = _Obj.getSafely($customer, 'tokens.items', []);
    const vpaToken = _Arr.find(tokens, item => item.id === token);

    return `${vpaToken.vpa.username}@${vpaToken.vpa.handle}`;
  }

  function getDetailsForAppInstrument(instrument, locale) {
    const provider = getAppProvider(instrument.provider);
    const providerName = getAppProviderName(provider.code, locale);
    return {
      title: getInstrumentTitle('app', providerName, locale),
      icon: provider.logo,
      code: provider.code,
      subtitle:
        provider?.code === 'cred'
          ? getAppInstrumentSubtext(provider.code, locale) || ''
          : '',
    };
  }

  function getDetailsForPaypalInstrument(instrument, locale) {
    return {
      title: getInstrumentTitle('paypal', null, locale),
      icon: session.themeMeta.icons.paypal,
    };
  }

  function getDetailsForNetbankingInstrument(instrument, locale) {
    const banks = getBanks();
    const bankName = getLongBankName(
      instrument.bank,
      locale,
      banks[instrument.bank]
    );
    return {
      title: getInstrumentTitle('netbanking', bankName, locale),
      icon: getBankLogo(instrument.bank),
    };
  }

  function getDetailsForWalletInstrument(instrument, locale) {
    const wallet = getWallet(instrument.wallet);
    const walletName = getWalletName(wallet.code, locale);
    return {
      title: getInstrumentTitle('wallet', walletName, locale),
      icon: wallet.sqLogo,
    };
  }

  function getDetailsForUpiInstrument(instrument, locale) {
    // TODO: simplify
    let title, icon;
    if (instrument.flow === 'qr') {
      title = getInstrumentTitle('upiqr', null, locale);
      icon = session.themeMeta.icons['qr'];
    } else if (instrument.flow === 'intent') {
      const app = _Arr.find(
        getUPIIntentApps().all,
        app => app.package_name === instrument.app
      );

      // In case of ios, app name might be missing if not sent by the sdk
      let appName = app.app_name || 'Unknown app';

      // shortcode might not be present for existing instruments. Check for backward compatibility.
      if (app.shortcode) {
        appName = getUpiIntentAppName(app.shortcode, locale, appName);
      }

      title = getInstrumentTitle('upi', appName.replace(/ UPI$/, ''), locale);

      if (app.app_icon) {
        icon = app.app_icon;
      } else {
        icon = '&#xe70e;';
      }
    } else {
      title = getInstrumentTitle(
        'upi',
        getVpaFromInstrument(instrument),
        locale
      );
      icon = '&#xe70e;';
    }

    return {
      title,
      icon,
    };
  }

  function getDetailsForCardlessEmiInstrument(instrument, locale) {
    const provider = getCardlessEmiProvider(instrument.provider);
    let providerCode = provider.code;
    if (providerCode === 'cards' && isDebitEMIEnabled()) {
      providerCode = 'credit_debit_cards';
    }
    const providerName = getCardlessEmiProviderName(providerCode, locale);
    return {
      title: getInstrumentTitle('cardless_emi', providerName, locale),
      icon: provider.sqLogo,
    };
  }

  function getDetailsForPayLaterInstrument(instrument, locale) {
    const provider = getPaylaterProvider(instrument.provider);
    const providerName = getPaylaterProviderName(provider.code, locale);
    return {
      title: getInstrumentTitle('paylater', providerName, locale),
      icon: provider.sqLogo,
    };
  }

  function getDetailsForInstrument(instrument, locale) {
    switch (instrument.method) {
      case 'paypal':
        return getDetailsForPaypalInstrument(instrument, locale);

      case 'netbanking':
        return getDetailsForNetbankingInstrument(instrument, locale);

      case 'wallet':
        return getDetailsForWalletInstrument(instrument, locale);

      case 'upi':
        return getDetailsForUpiInstrument(instrument, locale);

      case 'cardless_emi':
        return getDetailsForCardlessEmiInstrument(instrument, locale);

      case 'paylater':
        return getDetailsForPayLaterInstrument(instrument, locale);

      case 'app':
        return getDetailsForAppInstrument(instrument, locale);
    }
  }

  $: {
    const details = getDetailsForInstrument(individualInstrument, $locale);
    if (details) {
      title = details.title;
      icon = details.icon;
      code = details.code;
      if (details?.subtitle) {
        subtitle = details?.subtitle;
      }
    }
  }

  /**
   * If the instrument is selected, and the user
   * presses enter, mark this as a submission
   */
  function attemptSubmit(event) {
    if (!selected) {
      return;
    }

    const code = _.getKeyFromEvent(event);

    if (code === '13' || code === 13) {
      dispatch('submit');
    }
  }
  $: {
    if (selected) {
      downtimeSeverity = instrument.downtimeSeverity;
      downtimeInstrument = instrument.downtimeInstrument;
    } else {
      downtimeSeverity = false;
    }
  }
</script>

<SlottedRadioOption
  ellipsis
  {name}
  {selected}
  className="instrument"
  attributes={{
    'data-type': 'individual',
    'data-id': instrument.id,
    'data-code': code,
  }}
  value={instrument.id}
  expandOnSelect={contactRequired}
  on:click
  on:keydown={attemptSubmit}
>
  <i slot="icon">
    <Icon {icon} alt="" />
  </i>
  <div slot="title">{title}</div>
  <div slot="body">
    {#if contactRequired}
      <ContactField bind:country={$proxyCountry} bind:phone={$proxyPhone} />
    {/if}
  </div>
  <div slot="subtitle">
    {#if subtitle}
      {subtitle}
    {/if}
  </div>
  <div slot="downtime" class="downtime-preferred-method">
    {#if !!downtimeSeverity}
      <DowntimeCallout
        showIcon={true}
        severe={downtimeSeverity}
        {downtimeInstrument}
      />
    {/if}
  </div>
</SlottedRadioOption>

<style>
  .downtime-preferred-method {
    margin-top: 8px;
  }
</style>
