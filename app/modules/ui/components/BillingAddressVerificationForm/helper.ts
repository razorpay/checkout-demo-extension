// constants
import {
  AVS_STATE_ALL,
  AVS_LAST_NAME,
  AVS_FORM_CITY,
  AVS_FIRST_NAME,
  AVS_FORM_STATE,
  AVS_COUNTRY_ALL,
  AVS_FORM_COUNTRY,
  AVS_FORM_ZIP_CODE,
  AVS_STATE_SEARCH_TITLE,
  AVS_FORM_ADDRESS_LINE_1,
  AVS_FORM_ADDRESS_LINE_2,
  AVS_COUNTRY_SEARCH_TITLE,
} from 'ui/labels/avs-form';
import { SPACIAL_CHAR_REGEX } from './constants';
import fetch from 'utils/fetch';
import * as _ from 'utils/_';
// analytics
import { Track } from 'analytics';

// utils
import { makeAuthUrl } from 'common/helper';
import { toTitleCase } from 'lib/utils';

// types
import {
  FORM_FIELDS,
  TranslateType,
  CountryStateReturnType,
  FormFieldType,
  SearchModalFieldSType,
  FormValuesType,
  FormErrorsType,
} from './types';

// TODO handle response type
// declare function fetch<ResponseType>(options: {
//   url: string;
//   callback: (response: ResponseType) => void;
// }): Promise<ResponseType>;

const fieldDetails = (t: TranslateType, field: string) => {
  switch (field) {
    case FORM_FIELDS.first_name:
      return {
        id: field,
        placeholder: t(AVS_FIRST_NAME),
        autocomplete: '__off__',
        required: true,
      };
    case FORM_FIELDS.last_name:
      return {
        id: field,
        placeholder: t(AVS_LAST_NAME),
        autocomplete: '__off__',
        required: true,
      };
    case FORM_FIELDS.line1:
      return {
        id: field,
        placeholder: t(AVS_FORM_ADDRESS_LINE_1),
        autocomplete: '__off__',
        required: true,
      };
    case FORM_FIELDS.line2:
      return {
        id: field,
        placeholder: t(AVS_FORM_ADDRESS_LINE_2),
        autocomplete: '__off__',
        required: false,
      };
    case FORM_FIELDS.city:
      return {
        id: field,
        placeholder: t(AVS_FORM_CITY),
        autocomplete: '__off__',
        required: true,
      };
    case FORM_FIELDS.country:
      return {
        id: field,
        placeholder: t(AVS_FORM_COUNTRY),
        autocomplete: '__off__',
        searchable: true,
        required: true,
      };
    case FORM_FIELDS.postal_code:
      return {
        id: field,
        placeholder: t(AVS_FORM_ZIP_CODE),
        autocomplete: '__off__',
        required: true,
      };
    case FORM_FIELDS.state:
      return {
        id: field,
        placeholder: t(AVS_FORM_STATE),
        autocomplete: '__off__',
        searchable: true,
        required: true,
      };
    default:
      return {
        id: FORM_FIELDS.state,
        placeholder: '',
        autocomplete: 'do-not-autocomplete',
        required: true,
      };
  }
};

export const createFormFields = (
  t: TranslateType,
  formFields: (FORM_FIELDS | FORM_FIELDS[])[]
): (FormFieldType | FormFieldType[])[] => {
  return formFields.map((fields) => {
    if (Array.isArray(fields)) {
      return fields.map((field) => fieldDetails(t, field));
    }
    return fieldDetails(t, fields);
  });
};

export const createSearchModalFields = (
  t: TranslateType
): SearchModalFieldSType => {
  return {
    [FORM_FIELDS.country]: {
      data: [],
      keys: ['label'],
      all: t(AVS_COUNTRY_ALL),
      title: t(AVS_COUNTRY_SEARCH_TITLE),
      placeholder: t(AVS_COUNTRY_SEARCH_TITLE),
    },
    [FORM_FIELDS.state]: {
      data: [],
      keys: ['label'],
      all: t(AVS_STATE_ALL),
      title: t(AVS_STATE_SEARCH_TITLE),
      placeholder: t(AVS_STATE_SEARCH_TITLE),
    },
  };
};

export const combineFormValues = (
  value: { [x: string]: unknown },
  preFilledValue: { [x: string]: unknown }
) => {
  const clonedValue = { ...preFilledValue };
  if (value) {
    Object.keys(clonedValue).forEach((key) => {
      if (value[key] !== undefined) {
        clonedValue[key] = value[key];
      }
    });
    if (value.countryCode) {
      clonedValue.countryCode = value.countryCode;
    }
  }
  return clonedValue;
};

export const validateFormValues = (formValues: FormValuesType) => {
  let isValid = true;
  const errors: FormErrorsType = {};

  Object.keys(formValues).forEach((key) => {
    const value = (formValues[key] as string).trim();
    if (
      key !== FORM_FIELDS.line2 &&
      (value === '' || SPACIAL_CHAR_REGEX.test(value))
    ) {
      isValid = false;
      errors[key] = true;
    } else {
      errors[key] = false;
    }
  });

  return { isValid, errors };
};

export const findCountryByCodeOrName = (
  countries: CountryStateReturnType,
  code: string | unknown,
  isName = false
) => {
  const codeLower = (code as string).toLowerCase();
  return countries.find((country) =>
    isName
      ? country.label.toLowerCase() === codeLower
      : country.key.toLowerCase() === codeLower
  );
};

// apis
export const getAllCountries = (
  (cache: null | Promise<CountryStateReturnType>) => (rzpInstance: any) => {
    if (cache) {
      return cache;
    }

    let url = makeAuthUrl(rzpInstance, 'countries');

    const requestPayload = {
      '_[source]': Track.props.library,
    };

    url = _.appendParamsToUrl(url, requestPayload);

    cache = new Promise<CountryStateReturnType>((resolve, reject) => {
      fetch({
        url,
        callback: (
          response:
            | { error: string }
            | { countryAlpha2Code: string; countryName: string }[]
        ) => {
          if (!Array.isArray(response) && response.error) {
            return reject(response.error);
          }

          resolve(
            response && Array.isArray(response)
              ? response.map((country) => {
                  return {
                    _key: country.countryAlpha2Code.toUpperCase(),
                    key: country.countryAlpha2Code.toUpperCase(),
                    label: toTitleCase(country.countryName),
                    type: FORM_FIELDS.country,
                  };
                })
              : []
          );
        },
      });
    });

    return cache;
  }
)(null);

export const getStatesWithCountryCode = (
  (cache: { [x: string]: Promise<CountryStateReturnType> }) =>
  (rzpInstance: any, countryCode: string) => {
    if (cache[countryCode] !== undefined) {
      return cache[countryCode];
    }

    let url = makeAuthUrl(rzpInstance, `states/${countryCode.toLowerCase()}`);

    const requestPayload = {
      '_[source]': Track.props.library,
    };

    url = _.appendParamsToUrl(url, requestPayload);

    const request = new Promise<CountryStateReturnType>((resolve, reject) => {
      fetch({
        url,
        callback: (response: {
          error?: string;
          states: { stateCode: string; stateName: string }[];
        }) => {
          if (response.error) {
            return reject(response.error);
          }

          resolve(
            response
              ? response.states.map((state) => {
                  return {
                    _key: state.stateCode,
                    key: state.stateCode,
                    label: toTitleCase(state.stateName),
                    type: FORM_FIELDS.state,
                  };
                })
              : []
          );
        },
      });
    });

    cache[countryCode] = request;
    return request;
  }
)({});
