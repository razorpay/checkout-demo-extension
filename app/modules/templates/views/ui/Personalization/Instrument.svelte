<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Field from 'templates/views/ui/Field.svelte';
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';

  // Utils imports
  import { findCodeByNetworkName } from 'common/card';
  import { getSession } from 'sessionmanager';
  import PreferencesStore from 'checkoutstore/preferences';
  import { getIcon as getNetworkIcon } from 'icons/network';
  import { getBankLogo } from 'common/bank';
  import { getWallet } from 'common/wallet';

  // Props
  export let instrument = {}; // P13n instrument
  export let name; // Name of the input
  export let selected = false; // Whether or not this instrument is selected

  const session = getSession();
  const dispatch = createEventDispatcher();

  let text;
  let icon;
  let alt;

  $: {
    const banks = PreferencesStore.get().methods.netbanking;
    let wallet;
    let flow;
    let vpaSplit;

    switch (instrument.method) {
      case 'paypal':
        text = 'PayPal';
        icon = session.themeMeta.icons.paypal;
        alt = 'PayPal';
        break;

      case 'netbanking':
        text = `Netbanking - ${banks[instrument.bank]} `;
        icon = getBankLogo(instrument.bank);
        alt = banks[instrument.bank];
        break;
      case 'wallet':
        wallet = getWallet(instrument.wallet);
        text = `Wallet - ${wallet.name}`;
        icon = wallet.sqLogo;
        alt = wallet;
        break;
      case 'upi':
        if (instrument['_[upiqr]'] === '1') {
          text = `UPI QR`;
          icon = session.themeMeta.icons['qr'];
          alt = text;
          break;
        }

        flow = instrument['_[flow]'];
        if (flow === 'intent') {
          text = `UPI - ${instrument.app_name.replace(/ UPI$/, '')}`;
          if (instrument.app_icon) {
            icon = instrument.app_icon;
            alt = instrument.app_name;
          } else {
            icon = '&#xe70e';
            alt = 'UPI App';
          }
        } else {
          vpaSplit = instrument.vpa.split('@');
          text = `UPI - ${vpaSplit[0]}@${vpaSplit[1]}`;
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
</script>

<SlottedRadioOption
  {name}
  {selected}
  value={instrument.id}
  className="p13n-instrument"
  on:click
  on:keydown={attemptSubmit}>
  <i slot="icon">
    <Icon {icon} {alt} />
  </i>
  <div slot="title">{text}</div>
</SlottedRadioOption>
