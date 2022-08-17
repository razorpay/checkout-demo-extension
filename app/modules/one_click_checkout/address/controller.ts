import { get, Writable } from 'svelte/store';
import { hydrateSamePincodeAddresses } from 'one_click_checkout/address/helpersExtra';
import { postServiceability } from 'one_click_checkout/address/service';
import { postAddressSelection } from 'one_click_checkout/address/sessionInterface';
import { savedAddresses } from 'one_click_checkout/address/store';

export async function getServiceability(address: any) {
  const _savedAddresses = get(savedAddresses);
  return postServiceability([address], true, false)
    .then((res) => {
      return hydrateSamePincodeAddresses(_savedAddresses, res);
    })
    .catch((e) => {
      return hydrateSamePincodeAddresses(_savedAddresses, {
        [address.zipcode]: {
          ...e.payload?.addresses?.[0],
          serviceable: false,
        },
      });
    })
    .then((addresses) => {
      (savedAddresses as Writable<any[]>).set(addresses);
      postAddressSelection();
    });
}
