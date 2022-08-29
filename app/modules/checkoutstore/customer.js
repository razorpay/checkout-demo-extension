import { writable } from 'svelte/store';
import { updateCardTokenMetadata } from 'common/card';
import * as ObjectUtils from 'utils/object';

export const customer = writable({});

// Subscribers
customer.subscribe((updatedCustomer) => {
  // Update card metadata from customer tokens
  const tokenList = ObjectUtils.get(updatedCustomer, 'tokens.items');
  if (tokenList) {
    tokenList.forEach((t) => updateCardTokenMetadata(t.id, t.card));
  }
});

export const isLoggedIn = writable(false);
