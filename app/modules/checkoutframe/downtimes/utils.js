import downtimeAlertView from 'checkoutframe/downtimes/alert';
let downtimeAlertModal;
export const checkForDowntime = function(payload) {
  var downtimeSeverity = payload.downtimeSeverity;
  var downtimeInstrument = payload.downtimeInstrument;

  if (!!downtimeSeverity && downtimeSeverity === 'high') {
    return downtimeInstrument;
  }
  return false;
}

export const showDowntimeAlert = function(downtimeInstrument) {
  if (!downtimeAlertModal) {
    downtimeAlertModal = new downtimeAlertView();
  }
  downtimeAlertModal.view.handleChange(downtimeInstrument);
}