import { writable } from 'svelte/store';
import { updateCardTokenMetadata } from 'common/card';

export const customer = writable({});

// Subscribers
customer.subscribe(updatedCustomer => {
  // Update card metadata from customer tokens
  const tokenList = _Obj.getSafely(updatedCustomer, 'tokens.items');
  if (tokenList) {
    _Arr.loop(tokenList, t => updateCardTokenMetadata(t.id, t.card));
  }
});
