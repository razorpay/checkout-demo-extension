export interface CountryConfig {
  [key: string]: {
    pattern: string | null;
    name: string;
    phone_number_regex: null | string;
    dial_code: string;
  };
}
