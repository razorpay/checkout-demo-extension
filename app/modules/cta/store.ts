import { get, Writable, writable } from 'svelte/store';
import { getAmount, getCurrency } from 'razorpay';

type CTAState = {
  showAmount?: boolean;
  show?: boolean;
  label?: string;
  disabled?: boolean;
  labelData?: Record<string, string>;
  variant?: 'disabled' | '';
  onSubmit?: (...args: any) => void;
  onViewDetailsClick?: () => void;
};

class CTAStore {
  store: Writable<{
    amount: number;
    currency: string;
    rawAmount?: string;
  }>;

  stateMap: Writable<Record<string, CTAState>>;

  activeCTAScreen: Writable<string>;

  backupCTAState: CTAState;

  constructor() {
    this.store = writable({
      amount: getAmount(),
      currency: getCurrency(),
    });
    this.stateMap = writable({
      'default-tab': {
        show: true,
      },
    });

    this.activeCTAScreen = writable('');
    this.backupCTAState = { show: true };
  }

  setActiveCTAScreen(screen: string) {
    this.activeCTAScreen.set(screen);
  }

  getActiveState() {
    return get(this.stateMap)[get(this.activeCTAScreen)] || {};
  }

  triggerAction(...args: any) {
    const fn = this.getActiveState().onSubmit;
    if (typeof fn === 'function') {
      fn(...args);
    }
  }

  setCurrency(currency: string) {
    this.store.update((existing) => ({ ...existing, currency }));
  }

  setAmount(amount: number, currency?: string) {
    this.store.update((existing) => ({
      ...existing,
      amount,
      currency: currency || existing.currency || getCurrency(),
      rawAmount: '',
    }));
  }

  setRawAmount(amount: string) {
    this.store.update((existing) => ({
      ...existing,
      rawAmount: amount,
    }));
  }

  setState(state: CTAState = {}, key = 'default-tab') {
    this.stateMap.update((existing) => ({
      ...existing,
      [key]: {
        ...(existing[key] || {}),
        ...state,
      },
    }));
  }

  isCTAShown() {
    return this.getActiveState().show;
  }

  onViewDetailsClick() {
    const fn = this.getActiveState().onViewDetailsClick;
    if (typeof fn === 'function') {
      fn();
    }
  }
}
const STORE = new CTAStore();
export default STORE;
