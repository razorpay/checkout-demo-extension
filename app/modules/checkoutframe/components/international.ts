// store
import {
  getIsNVSFormHomeScreenView,
  getFormDataAndEntities,
  isNVSRequired,
  updateSelectedProvider,
} from 'checkoutstore/screens/international';

// component
import InternationalTab from 'ui/tabs/international/index.svelte';
import { querySelector } from 'utils/doc';

// helpers
import { setView, destroyView } from './';

const INTERNATIONAL_TAB_NAME = 'international';

let internationalTab: InternationalTab | null = null;

/**
 * Helper function to render Instant Bank Transfer payment method
 * @param {Object} props Props to pass to International Tab
 * @returns {InternationalTab} svelte component instance
 */
export function internationalTabRender(props = {}) {
  const target = querySelector('#form-fields');

  if (!target) {
    return null;
  }

  internationalTab = new InternationalTab({
    target,
    props,
  });

  // moving bottom to bottom :D
  /**
   * its require because mounting of providers happen on click on international tab
   * bottom contain dcc, offers related UI & it suppose to below our payment methods
   * without this wallet tab is added after bottom which prevent DCC to show properly on screen(check Bottom.svelte).
   */
  const bottom = querySelector('#bottom');
  if (bottom) {
    target.appendChild(bottom);
  }

  setView(INTERNATIONAL_TAB_NAME, internationalTab);
  internationalTab.onShown();

  return internationalTab;
}

/**
 * Helper function to destroy international tab and nullify component reference
 */
export function internationalTabDestroy() {
  destroyView(INTERNATIONAL_TAB_NAME);
  internationalTab = null;
}

/**
 * Helper function to check if AVS screen is rendered on Instant Bank Transfer payment method
 * @returns {boolean} It returns true if AVS screen is rendered
 */
export function isInternationalAVSView() {
  if (internationalTab) {
    return internationalTab.isOnNVSForm();
  }
  return false;
}

/**
 * Helper function to show AVS Form on Instant Bank Transfer payment method
 * @param {boolean} direct Indicate to render AVS Form, if it directly coming from home screen
 */
export function showInternationalAVS(direct: boolean) {
  if (internationalTab) {
    internationalTab.showNVSForm(direct);
  }
}

/**
 * Helper function to trigger back press on the component
 * @returns {boolean}
 */
export function internationalTabBackPress() {
  if (
    internationalTab &&
    internationalTab.onBack() &&
    !getIsNVSFormHomeScreenView()
  ) {
    return true;
  }
  internationalTabDestroy();
  return false;
}

/**
 * International Tab name constant
 */
export { INTERNATIONAL_TAB_NAME };

/**
 * Helper function get get International Stores data
 * @returns {{ NVSEntities: { [key in string]: boolean } | null, NVSFormData: { [key in string]: string } | null, NVSRequired: boolean, isNVSFormHomeScreenView: boolean, selectedInternationalProvider: string }}
 */
export function getInternationalTabData() {
  return {
    ...getFormDataAndEntities(),
    NVSRequired: isNVSRequired(),
    isNVSFormHomeScreenView: getIsNVSFormHomeScreenView(),
  };
}

/**
 * Helper function to update the provider(trustly, poli)
 * @param {string} provider Provider name to update
 */
export function updateInternationalProvider(provider: string) {
  const { NVSEntities } = getFormDataAndEntities();

  updateSelectedProvider(provider);

  return NVSEntities && provider ? NVSEntities[provider] : false;
}
