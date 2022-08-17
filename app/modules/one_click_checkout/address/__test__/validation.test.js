import { formatMessageWithLocale } from 'i18n';
import { validateInputField } from 'one_click_checkout/address/helpers';
import addressLabels from 'one_click_checkout/address/i18n/en';
import { setupPreferences } from 'tests/setupPreferences';
import { INDIA_PINCODE_REGEX, INDIA_COUNTRY_ISO_CODE } from 'common/constants';
import { CITY_STATE_REGEX_PATTERN } from 'one_click_checkout/address/constants';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const {
  name_label: NAME_LABEL,
  city_label: CITY_LABEL,
  house_label: HOUSE_LABEL,
  area_label: AREA_LABEL,
  landmark_label: LANDMARK_LABEL,
  name_lang_error: NAME_LANG_ERROR,
  address_lang_error: ADDRESS_LANG_ERROR,
  pincode_label: PINCODE_LABEL,
  pincode_error_message: PINCODE_ERROR_LABEL,
  zipcode_error_label: ZIPCODE_ERROR_LABEL,
  state_label: STATE_LABEL,
  city_state_error_label: CITY_STATE_ERROR_LABEL,
} = addressLabels;

const cityStateInvalidValue = [
  '637$%^',
  '@#$!',
  'Salem@#$!',
  '2345Salem@#$!',
  '33456',
];

const cityStateValidValue = [
  'Salem',
  'Kerala',
  'Bengaluru',
  'Karnataka',
  'Jammu & Kashmir',
  'Saint-Gobaîn',
];

const cityFieldDataInvalid = [
  [
    {
      value: cityStateInvalidValue,
      props: {
        id: 'city',
        label: CITY_LABEL,
        required: true,
        autofillToken: 'none',
        pattern: CITY_STATE_REGEX_PATTERN,
      },
    },
    CITY_STATE_ERROR_LABEL,
  ],
  [
    {
      value: cityStateInvalidValue,
      props: {
        id: 'state',
        label: STATE_LABEL,
        required: true,
        items: [],
        pattern: CITY_STATE_REGEX_PATTERN,
      },
    },
    CITY_STATE_ERROR_LABEL,
  ],
];

const cityFieldDataValid = [
  [
    {
      value: cityStateValidValue,
      props: {
        id: 'city',
        label: CITY_LABEL,
        required: true,
        autofillToken: 'none',
        pattern: CITY_STATE_REGEX_PATTERN,
      },
    },
  ],
  [
    {
      value: cityStateValidValue,
      props: {
        id: 'state',
        label: STATE_LABEL,
        required: true,
        items: [],
        pattern: CITY_STATE_REGEX_PATTERN,
      },
    },
  ],
];

const fieldData = [
  [
    {
      value: 'கண்ணன்',
      props: {
        id: 'name',
        label: NAME_LABEL,
        required: true,
        autofillToken: 'name',
        pattern: '^.{2,64}$',
      },
    },
    NAME_LANG_ERROR,
  ],
  [
    {
      value: 'சேலம்',
      props: {
        id: 'city',
        label: CITY_LABEL,
        required: true,
        autofillToken: 'none',
      },
    },
    ADDRESS_LANG_ERROR,
  ],
  [
    {
      value: 'SJR சைபர் லஸ்கர்',
      props: {
        id: 'line1',
        label: HOUSE_LABEL,
        required: true,
        pattern: '^.{1,255}$',
        autofillToken: 'address-line1',
      },
    },
    ADDRESS_LANG_ERROR,
  ],
  [
    {
      value: 'ஓசூர் ரோடு, ஆடுகோடி',
      props: {
        id: 'line2',
        label: AREA_LABEL,
        required: true,
        pattern: '^.{1,255}$',
        autofillToken: 'address-line2',
      },
    },
    ADDRESS_LANG_ERROR,
  ],
  [
    {
      value: 'கோவில் அருகில்',
      props: {
        id: 'landmark',
        label: LANDMARK_LABEL,
        pattern: '^.{2,32}$',
        autocomplete: true,
      },
    },
    ADDRESS_LANG_ERROR,
  ],
];

const pincodeFieldProps = {
  id: 'zipcode',
  label: PINCODE_LABEL,
  required: true,
  unserviceableText: '',
  autofillToken: 'postal-code',
  disabled: false,
  hideStatusText: false,
  pattern: INDIA_PINCODE_REGEX,
};

describe('Validate City Field on Address Form for invalid case', () => {
  test.each(cityFieldDataInvalid)(
    'should return error message for wrong value',
    (field, errorMsg) => {
      if (Array.isArray(field.value)) {
        const { value: listOfValues, props } = field;
        listOfValues.forEach((value) => {
          expect(
            formatMessageWithLocale(validateInputField(value, props))
          ).toBe(errorMsg);
        });
      }
    }
  );
});

describe('Validate City Field on Address Form for valid case', () => {
  test.each(cityFieldDataValid)(
    'should return undefined for correct value',
    (field) => {
      if (Array.isArray(field.value)) {
        const { value: listOfValues, props } = field;
        listOfValues.forEach((value) => {
          expect(validateInputField(value, props)).toBeUndefined();
        });
      }
    }
  );
});

describe('Validate Input Field for Address Form', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      features: { one_cc_input_english: true },
    });
  });
  test.each(fieldData)(
    'should return error message for wrong value',
    (fieldInfo, errorMsg) => {
      const { value, props } = fieldInfo;
      expect(formatMessageWithLocale(validateInputField(value, props))).toBe(
        errorMsg
      );
    }
  );
  test('pincode validation for domestic on invalid case', () => {
    const pincodeFieldValue = '637';

    expect(
      formatMessageWithLocale(
        validateInputField(
          pincodeFieldValue,
          pincodeFieldProps,
          INDIA_COUNTRY_ISO_CODE
        )
      )
    ).toBe(PINCODE_ERROR_LABEL);
  });
  test('pincode validation for domestic on valid case', () => {
    const pincodeFieldValue = '637402';

    expect(
      validateInputField(
        pincodeFieldValue,
        pincodeFieldProps,
        INDIA_COUNTRY_ISO_CODE
      )
    ).toBeUndefined();
  });
  test('pincode validation for international on invalid case', () => {
    const pincodeFieldValue = '637';
    const pincodeFieldIntProps = {
      ...pincodeFieldProps,
      pattern: '^[0-9]{5}(?:[-s][0-9]{4})?$',
    };

    const US_ISO_CODE = 'us';
    expect(
      formatMessageWithLocale(
        validateInputField(pincodeFieldValue, pincodeFieldIntProps, US_ISO_CODE)
      )
    ).toBe(ZIPCODE_ERROR_LABEL);
  });
  test('pincode validation for international on valid case', () => {
    const pincodeFieldValue = '99950';
    const pincodeFieldIntProps = {
      ...pincodeFieldProps,
      pattern: '^[0-9]{5}(?:[-s][0-9]{4})?$',
    };

    const US_ISO_CODE = 'us';
    expect(
      validateInputField(pincodeFieldValue, pincodeFieldIntProps, US_ISO_CODE)
    ).toBeUndefined();
  });
});
