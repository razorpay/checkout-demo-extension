import { getEventsName } from '../helpers';

// Events for home screen
const homeScreen = {
  HOME_LOADED: 'checkoutHomeScreenLoaded',
  PAYMENT_INSTRUMENT_SELECTED: 'checkoutPaymentInstrumentSelected',
  PAYMENT_METHOD_SELECTED: 'checkoutPaymentMethodSelected',
  METHODS_SHOWN: 'methods:shown',
  METHODS_HIDE: 'methods:hide',
  P13N_EXPERIMENT: 'p13n:experiment',
  LANDING: 'landing',
  PROCEED: 'proceed',
  COD_METHOD: 'cod:method',
  COD_METHOD: 'checkoutCODOptionShown',
  COD_METHOD_SELECTED: 'checkoutCODOptionSelected',
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

export default getEventsName('home', events);

export { ContactDetailsEvents };
