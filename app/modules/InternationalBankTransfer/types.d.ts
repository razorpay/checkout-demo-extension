export type InstrumentMethods = {
  [key: string]: number;
  va_eur: number;
  va_gbp: number;
  va_usd: number;
  va_cad: number;
};

export type VA_RESPONSE_TYPE = {
  error: {
    description: string;
  } | null;
  account: {
    routing_code: string;
    routing_type: string;
    account_number: number;
    beneficiary_name: string;
    va_currency: string;
  };
  amount: number;
  currency: string;
  symbol: string;
};

export type PREFERRED_INSTRUMENT_TYPE = {
  method: string;
  providers: string[];
};
