// analytics
import { Events, MetaProperties } from 'analytics';

// events
enum DCCEventNames {
  render = 'dcc:render',
  currenciesLoading = 'dcc:currenciesLoading',
  currenciesFailed = 'dcc:currenciesFailed',
  currenciesSuccess = 'dcc:currenciesSuccess',
  selectedCurrencyChange = 'dcc:selectedCurrencyChange',
  selectCurrencyDialogOpen = 'dcc:selectCurrencyDialogOpen',
  currencySelectedFromDialog = 'dcc: currencySelectedFromDialog',
}

export const trackRender = () => Events.TrackRender(DCCEventNames.render);

export const addMetaProperties = (
  type?: string,
  data?: DCC.EventTrackDataType
) => {
  Events.setMeta(
    `${<string>(MetaProperties.DCC_DATA as unknown)}_${type || 'UNKNOWN'}`,
    data
  );
};

export const removeMetaProperties = (type?: string) => {
  Events.removeMeta(
    `${<string>(MetaProperties.DCC_DATA as unknown)}_${type || 'UNKNOWN'}`
  );
};

export const trackFetchCurrenciesLoading = () =>
  Events.Track(DCCEventNames.currenciesLoading);

export const trackFetchCurrenciesSuccess = (data: DCC.EventTrackDataType) => {
  Events.Track(DCCEventNames.currenciesSuccess, data);
};

export const trackFetchCurrenciesFailed = (data: DCC.EventTrackDataType) => {
  Events.Track(DCCEventNames.currenciesFailed, data);
};

export const trackSelectedCurrencyChange = (data: DCC.EventTrackDataType) => {
  Events.Track(DCCEventNames.selectedCurrencyChange, data);
};

export const trackSelectCurrencyDialogOpen = () => {
  Events.Track(DCCEventNames.selectCurrencyDialogOpen);
};

export const trackCurrencySelectedFromDialog = () => {
  Events.Track(DCCEventNames.currencySelectedFromDialog);
};
