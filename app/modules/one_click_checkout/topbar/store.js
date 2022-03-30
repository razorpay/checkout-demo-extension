import { writable } from 'svelte/store';
import {
  SUMMARY_LABEL,
  ADDRESS_LABEL,
  PAYMENTS_LABEL,
} from 'one_click_checkout/topbar/i18n/label';

export const breadcrumbItems = writable([
  SUMMARY_LABEL,
  ADDRESS_LABEL,
  PAYMENTS_LABEL,
]);

export const tabTitle = writable('');
