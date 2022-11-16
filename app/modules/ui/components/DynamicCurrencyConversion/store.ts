import { writable, get } from 'svelte/store';

/**
 * Being used to store dcc payload for external use
 */
export const DCCPayloadStore = writable<DCC.PayloadStore>({});

// actions
export const setDCCPayload = (data: DCC.PayloadStore) => {
  DCCPayloadStore.update((state) => ({
    ...data,
    method: data.method || state.method,
  }));
};

export const setPaymentMethodOnDCCPayload = (
  method: DCC.PayloadStore['method']
) => {
  DCCPayloadStore.update((state) => ({
    ...state,
    method,
  }));
};

export const resetDCCPayload = () => {
  DCCPayloadStore.set({});
};

export const getDCCPayloadData = () => get(DCCPayloadStore);
