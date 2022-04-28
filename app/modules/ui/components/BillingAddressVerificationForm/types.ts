export enum FORM_TYPE {
  AVS = 'AVS',
  N_AVS = 'N_AVS',
}

export enum FORM_FIELDS {
  first_name = 'first_name',
  last_name = 'last_name',
  line1 = 'line1',
  line2 = 'line2',
  city = 'city',
  postal_code = 'postal_code',
  country = 'country',
  countryCode = 'countryCode', // to store country ISO code
  state = 'state',
}

export type TranslateType = (arg: string) => string;

export type CountryStateReturnType = {
  key: string;
  label: string;
  type: string;
}[];

export type FilterCallbackType =
  | ((countries: CountryStateReturnType) => CountryStateReturnType)
  | null;

export type FormFieldType = {
  id: FORM_FIELDS;
  placeholder: string;
  autocomplete: string;
  required: boolean;
  searchable?: boolean;
};

export type SearchModalFieldType = {
  data: CountryStateReturnType;
  keys: string[];
  all: string;
  title: string;
  placeholder: string;
};

export type SearchModalFieldSType = {
  [FORM_FIELDS.country]: SearchModalFieldType;
  [FORM_FIELDS.state]: SearchModalFieldType;
};

type FieldsObject<T = unknown> = {
  [x in keyof typeof FORM_FIELDS | string]?: T;
};

export type FormValuesType = FieldsObject;

export type FormErrorsType = FieldsObject<boolean>;
