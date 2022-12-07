const events = {
  EDIT_PERSONAL_DETAILS_CLICKED:
    '1cc_account_screen_edit_personal_details_clicked',
  LANGUAGE_CLICKED: '1cc_account_screen_change_language_clicked',
  LOGOUT_CLICKED: '1cc_account_screen_logout_clicked',
  LOGOUT_ALL_DEVICES_CLICKED:
    '1cc_account_screen_logout_of_all_devices_clicked',
  CHANGE_LANGUAGE: 'Change_language_cta_click',
  SCREEN_DISMISSED: '1cc_account_screen_dismissed',
  ACCOUNT_CTA_CLICKED: '1cc_account_cta_clicked',
  ABOUT_MERCHANT_CLICKED: 'merchant_cta_click',
  FOH_ABOUT_MERCHANT_DISMISSED: 'foh_merchant_details_page_close',
  FOH_IFRAME_RENDERING_COMPLETE: 'foh_merchant_details_page',
} as const;

export default events;
