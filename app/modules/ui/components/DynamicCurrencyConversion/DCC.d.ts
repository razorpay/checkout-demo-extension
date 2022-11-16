declare namespace DCC {
  /**
   * @private
   */
  export type CustomerTokenType = {
    tokens?: {
      items?: { id: Props['id'] }[];
    };
  };

  /**
   * @private
   */
  export type Instrument = {
    dcc_enabled?: boolean;
    id?: Props['id'];
    token_id?: Props['id'];
    billing_address?: { [key in string]: string };
  };

  /**
   * @private
   */
  export type EntityInstrumentType = Instrument | string | number;

  /**
   * DCC currency type
   */
  export type Currency = string;

  /**
   * DCC Props types
   */
  export type Props = {
    id: string;
    className?: string;
    method?: string;
    selectedCurrency?: string;
    dccEnabled?: boolean;
    amount: number;
    originalCurrency: string;
    entity: Props['id'] | null;
    instrument: EntityInstrumentType | null;
    identifier: string;
    customer: CustomerTokenType;
    currency?: Currency;
  };

  /**
   * @private
   */
  export type CurrencyDataType = {
    _key?: string;
    forex_rate?: number;
    conversion_percentage?: number;
    code: string;
    denomination: number;
    min_value: number;
    min_auth_value: number;
    symbol: string;
    name: string;
    amount: number;
  };

  /**
   * @private
   */
  export type CurrencyListType = Array<
    CurrencyDataType & { currency: Currency }
  >;

  /**
   * @private
   */
  export type CurrenciesMapType = {
    [key in string]: CurrencyDataType;
  };

  /**
   * @private
   */
  export type GetCurrenciesResponseType = {
    all_currencies?: CurrenciesMapType;
    card_currency?: string;
    wallet_currency?: string;
    app_currency?: string;
    error?: string;
    show_markup?: boolean;
    currency_request_id: string;
    avs_required: boolean;
  };

  export type CurrencyMetaDataType = GetCurrenciesResponseType & {
    amount: Props['amount'];
    currencies: CurrencyListType;
    selectedCurrency?: Currency;
    originalCurrency: Currency;
  };

  /**
   * @private
   */
  export type SessionPayload = CurrencyMetaDataType & {
    currency?: Currency;
    enable?: boolean;
  };

  export type PayloadStore = {
    enable?: boolean;
    method?: Props['method'];
    selectedCurrency?: Currency;
    all_currencies?: CurrenciesMapType;
    card_currency?: string;
    wallet_currency?: string;
    app_currency?: string;
    error?: string;
    originalCurrency?: Currency;
    defaultCurrency?: Currency;
    currencies?: CurrencyListType;
    show_markup?: boolean;
    currency_request_id?: string;
    avs_required?: boolean;
  };

  export type PaymentRequestData = {
    [x: string]: string | undefined;
    method?: Props['method'];
  };

  export type EmitEventDataType =
    | CurrencyMetaDataType
    | {
        selectedCurrency: Currency;
        amount: Props['amount'];
      };

  export type EventTrackDataType = {
    currenciesCount?: number;
    avsRequiredFlagEnabled?: boolean;
    appCurrency?: Currency;
    walletCurrency?: Currency;
    cardCurrency?: Currency;
    previousSelectedCurrency?: Currency;
    selectedCurrency?: Currency;
    originalCurrency?: Currency;
    currencyRequestIdLoaded?: boolean;
    error?: string;
    method?: string;
    entity?: Props['entity'];
    identifier?: Props['identifier'];
    dccEnabled?: Props['dccEnabled'];
    amount?: Props['amount'];
  };
}
