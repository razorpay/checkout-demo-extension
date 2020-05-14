<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getBankLogo } from 'common/bank';
  import { getBanks } from 'checkoutstore';
  import { getWallet } from 'common/wallet';
  import { getProvider as getCardlessEmiProvider } from 'common/cardlessemi';
  import { getProvider as getPaylaterProvider } from 'common/paylater';
  import Track from 'tracker';
  import { getExtendedSingleInstrument } from 'configurability/instruments';

  // Store
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { customer } from 'checkoutstore/customer';

  // i18n
  import { locale } from 'svelte-i18n';
  import {
    getInstrumentTitle,
    getLongBankName,
    getWalletName,
    getCardlessEmiProviderName,
    getPaylaterProviderName,
  } from 'i18n';

  // Props
  export let instrument = {};
  export let name = 'instrument';

  let individualInstrument = getExtendedSingleInstrument(instrument);
  $: individualInstrument = getExtendedSingleInstrument(instrument);

  let selected = false;
  $: selected = $selectedInstrumentId === instrument.id;

  const session = getSession();
  const dispatch = createEventDispatcher();

  let title;
  let icon;
  let alt;

  function getVpaFromInstrument(instrument) {
    const { vpa, token } = instrument;

    if (vpa) {
      return vpa;
    }

    const tokens = _Obj.getSafely($customer, 'tokens.items', []);
    const vpaToken = _Arr.find(tokens, item => item.id === token);

    return `${vpaToken.vpa.username}@${vpaToken.vpa.handle}`;
  }

  function getDetailsForPaypalInstrument(instrument, locale) {
    return {
      title: getInstrumentTitle('paypal', null, locale),
      icon: session.themeMeta.icons.paypal,
      alt: 'PayPal',
    };
  }

  function getDetailsForNetbankingInstrument(instrument, locale) {
    const bankName = getLongBankName(individualInstrument.bank, locale);
    return {
      title: getInstrumentTitle('netbanking', bankName, locale),
      icon: getBankLogo(individualInstrument.bank),
      alt: bankName,
    };
  }

  function getDetailsForWalletInstrument(instrument, locale) {
    const wallet = getWallet(individualInstrument.wallet);
    const walletName = getWalletName(wallet.code, locale);
    return {
      title: getInstrumentTitle('wallet', walletName, locale),
      icon: wallet.sqLogo,
      alt: wallet.name,
    };
  }

  function getDetailsForUpiInstrument(instrument, locale) {
    // TODO: simplify
    let title, icon, alt;
    if (individualInstrument.flow === 'qr') {
      title = getInstrumentTitle('upiqr', null, locale);
      icon = session.themeMeta.icons['qr'];
      alt = title;
    } else if (individualInstrument.flow === 'intent') {
      const app = _Arr.find(
        session.upi_intents_data,
        app => app.package_name === individualInstrument.app
      );

      title = getInstrumentTitle(
        'upi',
        app.app_name.replace(/ UPI$/, ''),
        locale
      );

      if (app.app_icon) {
        icon = app.app_icon;
        alt = app.app_name;
      } else {
        icon = '&#xe70e;';
        alt = 'UPI App';
      }
    } else {
      title = getInstrumentTitle(
        'upi',
        getVpaFromInstrument(instrument),
        locale
      );
      icon = '&#xe70e;';
      alt = 'UPI';
    }

    return {
      title,
      icon,
      alt,
    };
  }

  function getDetailsForCardlessEmiInstrument(instrument, locale) {
    const provider = getCardlessEmiProvider(individualInstrument.provider);
    const providerName = getCardlessEmiProviderName(provider.code, $locale);
    return {
      title: getInstrumentTitle('emi', providerName, locale),
      icon: provider.sqLogo,
      alt: provider.name,
    };
  }

  function getDetailsForPayLaterInstrument(instrument, locale) {
    const provider = getPaylaterProvider(individualInstrument.provider);
    const providerName = getPaylaterProviderName(provider.code, locale);
    return {
      title: getInstrumentTitle('paylater', providerName, locale),
      icon: provider.sqLogo,
      alt: provider.name,
    };
  }

  function getDetailsForInstrument(instrument, locale) {
    switch (individualInstrument.method) {
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
    }
  }

  $: {
    const details = getDetailsForInstrument(individualInstrument, $locale);
    if (details) {
      title = details.title;
      icon = details.icon;
      alt = details.alt;
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

  function selectInstrument() {
    $selectedInstrumentId = instrument.id;
  }
</script>

<SlottedRadioOption
  ellipsis
  {name}
  {selected}
  className="instrument"
  attributes={{ 'data-type': 'individual' }}
  value={instrument.id}
  on:click
  on:click={selectInstrument}
  on:keydown={attemptSubmit}>
  <i slot="icon">
    <Icon {icon} {alt} />
  </i>
  <div slot="title">{title}</div>
</SlottedRadioOption>
