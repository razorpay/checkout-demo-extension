const events = {
  CONTACT_SCREEN_LOAD: '1cc_change_contact_screen_loaded',
  CONTACT_INPUT: 'checkoutConsumerContactEntered',
  CONTACT_EMAIL_INPUT: 'checkoutConsumerEmailtEntered',
  CONTACT_DETAILS_SUBMIT: '1cc_clicked_change_contact_continue_cta',
} as const;

export default events;
