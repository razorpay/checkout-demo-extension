<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getBankLogo } from 'common/bank';
  import PreferencesStore from 'checkoutstore/preferences';
  import { getWallet } from 'common/wallet';
  import Track from 'tracker';

  // Store
  import { contact, selectedInstrumentId } from 'checkoutstore/screens/home';

  // Props
  export let instrument = {}; // P13n instrument
  export let name = 'instrument';

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

    const customer = session.getCustomer($contact);
    const tokens = _Obj.getSafely(customer, 'tokens.items', []);
    const vpaToken = _Arr.find(tokens, item => item.id === token);

    return `${vpaToken.vpa.username}@${vpaToken.vpa.handle}`;
  }

  $: {
    const banks = PreferencesStore.get().methods.netbanking;
    let wallet;
    let flow;
    let vpaSplit;

    switch (instrument.method) {
      case 'paypal':
        title = 'PayPal';
        icon = session.themeMeta.icons.paypal;
        alt = 'PayPal';

        break;

      case 'netbanking':
        title = `Netbanking - ${banks[instrument.bank]} `;
        icon = getBankLogo(instrument.bank);
        alt = banks[instrument.bank];

        break;
      case 'wallet':
        wallet = getWallet(instrument.wallet);
        title = `Wallet - ${wallet.name}`;
        icon = wallet.sqLogo;
        alt = wallet;

        break;
      case 'upi':
        if (instrument['_[upiqr]'] === '1') {
          title = `UPI QR`;
          icon = session.themeMeta.icons['qr'];
          alt = title;

          break;
        } else if (instrument['_[flow]'] === 'intent') {
          title = `UPI - ${instrument.app_name.replace(/ UPI$/, '')}`;

          if (instrument.app_icon) {
            icon = instrument.app_icon;
            alt = instrument.app_name;
          } else {
            icon = '&#xe70e';
            alt = 'UPI App';
          }
        } else {
          title = `UPI - ${getVpaFromInstrument(instrument)}`;
          icon = '&#xe70e;';
          alt = 'UPI';
        }

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
