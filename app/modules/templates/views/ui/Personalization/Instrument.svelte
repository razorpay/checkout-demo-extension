<script>
  // UI imports
  import Field from 'templates/views/ui/Field.svelte';
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';

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
  export let customer = {}; // Current customer

  const session = getSession();

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
</script>

<SlottedRadioOption
  {name}
  value={instrument.id}
  className="p13n-instrument"
  on:click>
  <i slot="icon">
    {#if typeof icon === 'string' && icon.indexOf('http') === 0}
      <img src={icon} {alt} />
    {:else}
      {@html icon}
    {/if}
  </i>
  <div slot="title">{text}</div>
</SlottedRadioOption>
