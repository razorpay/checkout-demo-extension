import { getEventsName } from '../helpers';

// Events for home screen
const homeScreen = {
  HOME_LOADED: 'checkoutHomeScreenLoaded',
  HOME_LOADED_V2: '1cc_payment_home_screen_loaded',
  PAYMENT_INSTRUMENT_SELECTED: 'checkoutPaymentInstrumentSelected',
  PAYMENT_INSTRUMENT_SELECTED_V2: '1cc_payment_home_screen_instrument_selected',
  PAYMENT_METHOD_SELECTED: 'checkoutPaymentMethodSelected',
  PAYMENT_METHOD_SELECTED_V2: '1cc_payment_home_screen_method_selected',
  METHODS_SHOWN: 'methods:shown',
  METHODS_HIDE: 'methods:hide',
  P13N_EXPERIMENT: 'p13n:experiment',
  LANDING: 'landing',
  PROCEED: 'proceed',
};

const ContactDetailsEvents = {
  CONTACT_SCREEN_LOAD: 'checkoutConsumerDetailScreenLoaded',
  CONTACT_INPUT: 'checkoutConsumerContactEntered',
  CONTACT_EMAIL_INPUT: 'checkoutConsumerEmailtEntered',
  CONTACT_DETAILS_SUBMIT: 'checkoutConsumerDetailSubmitted',
};

// All card related events
const events = {
  ...homeScreen,
};

const COD_EVENTS = {
  COD_METHOD: 'checkoutCODOptionShown',
  COD_SHOWN_V2: '1cc_payment_home_screen_cod_option_shown',
  COD_METHOD_SELECTED: 'checkoutCODOptionSelected',
};

export default getEventsName('home', events);

export { ContactDetailsEvents, COD_EVENTS, homeScreen as HOME_EVENTS };
