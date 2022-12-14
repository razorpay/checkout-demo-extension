import { writable } from 'svelte/store';

export interface QrRenderState {
  status: boolean;
  homeScreenQR: boolean;
  upiScreenQR: boolean;
  upiScreenQRPosition: 'top' | 'bottom' | '';
  downtimePSPApps: string[];
}

const initialQrRenderState: QrRenderState = {
  status: false,
  homeScreenQR: false,
  upiScreenQR: false,
  upiScreenQRPosition: '',
  downtimePSPApps: [],
};

export const qrRenderState = writable<QrRenderState>(initialQrRenderState);

export function updateRenderQrState(data: QrRenderState) {
  qrRenderState.update((prevState: typeof data) => ({
    ...prevState,
    ...data,
  }));
}
