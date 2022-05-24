const events = {
  CONSENT_MODAL_LOADED: '1cc_load_saved_address_bottom_sheet_shown',
  CONSENT_MODAL_CLOSED: '1cc_dismissed_load_saved_address_bottom_sheet',
  CONSENT_MODAL_CTA_CLICKED: '1cc_clicked_load_saved_address_bottom_sheet_cta',
  CONSENT_FAILED_MODAL_LOADED: '1cc_address_load_failed_shown',
  CONSENT_FAILED_MODAL_CLOSED: '1cc_dismissed_address_load_failed',
  CONSENT_FAILED_MODAL_CTA_CLICKED: '1cc_clicked_retry_on_address_load_failed',
  BANNER_CTA_CLICKED: '1cc_clicked_on_allow_using_saved_addresses',
};

export default events;
