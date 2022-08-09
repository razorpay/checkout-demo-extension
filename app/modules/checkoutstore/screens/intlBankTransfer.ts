import { writable, get } from 'svelte/store';

export const selectedMethod = writable<string | null>(null);

export const setSelectedMethod = (method: string | null) => {
  selectedMethod.set(method);
};

export const isMethodSelected = () => !!get(selectedMethod);
