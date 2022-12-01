import { writable } from 'svelte/store';
import { LOADING_LABEL } from 'one_click_checkout/loader/i18n/labels';

export const showLoader = writable(false);
export const loaderLabel = writable(LOADING_LABEL);
export const loaderClass = writable('');
