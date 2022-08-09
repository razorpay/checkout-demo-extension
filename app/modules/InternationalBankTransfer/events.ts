// analytics
import { Events } from 'analytics';

const SCREEN_SHOW = 'intl_bank_transfer:screen:show';
const CURRENCY_SELECT = 'intl_bank_transfer:screen:currency_select';
const DIRECT_TO_DETAILS = 'intl_bank_transfer:screen:direct_to_details';
const ON_BACK = 'intl_bank_transfer:screen:on_back';
const COPY_DETAILS = 'intl_bank_transfer:details:copy_details';
const SUBMIT = 'intl_bank_transfer:details:submit';
const DETAILS_SHOW = 'intl_bank_transfer:details:show';
const UPDATE_AMOUNT_IN_HEADER =
  'intl_bank_transfer:details:update_amount_in_header';
const FETCH_DETAILS_SUCCESS =
  'intl_bank_transfer:details:fetch_details_success';
const FETCH_DETAILS_ERROR = 'intl_bank_transfer:details:fetch_details_error';

export const trackScreenShow = () => {
  Events.Track(SCREEN_SHOW);
};

export const trackCurrencySelect = (currency: string) => {
  Events.TrackBehav(CURRENCY_SELECT, { currency });
};

export const trackBackClick = (view: string) => {
  Events.TrackBehav(ON_BACK, { view });
};

export const trackDirectToDetails = (currency: string) => {
  Events.Track(DIRECT_TO_DETAILS, { currency });
};

export const trackCopyDetails = (currency: string) => {
  Events.TrackBehav(COPY_DETAILS, { currency });
};

export const trackSubmit = (payload: unknown, currency: string) => {
  Events.TrackBehav(SUBMIT, { payload, currency });
};

export const trackDetailsShow = (currency: string) => {
  Events.Track(DETAILS_SHOW, { currency });
};

export const trackUpdateAmountInHeader = (amount: string, currency: string) => {
  Events.TrackBehav(UPDATE_AMOUNT_IN_HEADER, { amount, currency });
};

export const trackFetchDetailsSuccess = (currency: string) => {
  Events.Track(FETCH_DETAILS_SUCCESS, { currency });
};

export const trackFetchDetailsError = (currency: string, payload: unknown) => {
  Events.Track(FETCH_DETAILS_ERROR, { currency, payload });
};
