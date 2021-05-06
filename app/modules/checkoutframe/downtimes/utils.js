import downtimeAlertView from 'checkoutframe/downtimes/alert';
let downtimeAlertModal;
export const checkForDowntime = function(payload) {
  const downtimeSeverity = payload.downtimeSeverity;
  const downtimeInstrument = payload.downtimeInstrument;

  if (downtimeSeverity === 'high') {
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