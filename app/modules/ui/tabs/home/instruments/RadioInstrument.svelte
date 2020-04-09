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

  $: {
    const banks = getBanks();
    let wallet;
    let flow;
    let vpaSplit;
    let provider;

    switch (individualInstrument.method) {
      case 'paypal':
        title = 'PayPal';
        icon = session.themeMeta.icons.paypal;
        alt = 'PayPal';

        break;

      case 'netbanking':
        title = `Netbanking - ${banks[individualInstrument.bank]} `;
        icon = getBankLogo(individualInstrument.bank);
        alt = banks[individualInstrument.bank];

        break;
      case 'wallet':
        wallet = getWallet(individualInstrument.wallet);
        title = `Wallet - ${wallet.name}`;
        icon = wallet.sqLogo;
        alt = wallet.name;

        break;
      case 'upi':
        if (individualInstrument.flow === 'qr') {
          title = `UPI QR`;
          icon = session.themeMeta.icons['qr'];
          alt = title;

          break;
        } else if (individualInstrument.flow === 'intent') {
          const app = _Arr.find(
            session.upi_intents_data,
            app => app.package_name === individualInstrument.app
          );

          title = `UPI - ${app.app_name.replace(/ UPI$/, '')}`;

          if (app.app_icon) {
            icon = app.app_icon;
            alt = app.app_name;
          } else {
            icon = '&#xe70e;';
            alt = 'UPI App';
          }
        } else {
          title = `UPI - ${getVpaFromInstrument(instrument)}`;
          icon = '&#xe70e;';
          alt = 'UPI';
        }

        break;

      case 'cardless_emi':
        provider = getCardlessEmiProvider(individualInstrument.provider);
        title = `EMI - ${provider.name}`;
        icon = provider.sqLogo;
        alt = provider.name;

        break;

      case 'paylater':
        provider = getPaylaterProvider(individualInstrument.provider);
        title = `Pay Later - ${provider.name}`;
        icon = provider.sqLogo;
        alt = provider.name;

        break;
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
  value={instrument.id}
  on:click
  on:click={selectInstrument}
  on:keydown={attemptSubmit}>
  <i slot="icon">
    <Icon {icon} {alt} />
  </i>
  <div slot="title">{title}</div>
</SlottedRadioOption>
