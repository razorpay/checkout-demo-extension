import { writable, get } from 'svelte/store';

// type string
export const selectedInternationalProvider = writable('');

/**
 * type {
 *  first_name: string;
 *  last_name: string;
 *  line_1: string;
 *  line_2?: string;
 *  city: string;
 *  zip_code: string;
 *  country: string;
 *  state: string;
 * } | null
 */
export const NVSFormData = writable(null);

/**
 * type { [key in string]: boolean } | null;
 */
export const NVSEntities = writable(null);

/**
 * type boolean
 */
export const isNVSFormHomeScreenView = writable(false);

/** ACTIONS */
export const updateSelectedProvider = (data) => {
  selectedInternationalProvider.set(data);
};

export const updateNVSEntities = (entity, value) => {
  NVSEntities.update((val) => {
    return {
      ...val,
      // NVS screen by default will be enabled
      [entity]: value !== false,
    };
  });
};

export const setNVSFormData = (data) => {
  NVSFormData.set(data);
};

export const resetNVSEntities = () => {
  NVSEntities.set(null);
};

export const resetNVSFormData = () => {
  NVSFormData.set(null);
};

export const setIsNVSFormHomeScreenView = (value) => {
  isNVSFormHomeScreenView.set(value);
};

export const getIsNVSFormHomeScreenView = () => get(isNVSFormHomeScreenView);

/**
 * Get Form data and Entities
 * @returns {{ NVSEntities: { [key in string]: boolean } | null, NVSFormData: { [key in string]: string } | null, selectedInternationalProvider: string }}
 */
export const getFormDataAndEntities = () => ({
  NVSFormData: get(NVSFormData),
  NVSEntities: get(NVSEntities),
  selectedInternationalProvider: get(selectedInternationalProvider),
});

/**
 * Get is nvs required or not
 * @returns {boolean}
 */
export const isNVSRequired = () => {
  const nvsEntities = get(NVSEntities);
  const selectedProvider = get(selectedInternationalProvider);
  return nvsEntities && selectedProvider
    ? nvsEntities[selectedProvider]
    : false;
};
