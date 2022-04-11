import { getEventsName } from '../helpers';

const offers = {
  APPLY: 'apply',
};

const events = {
  ...offers,
};

export default getEventsName('offer', events);

export const EVENTS = {
  OFFERS_CLICKED: '1cc_clicked_on_payment_offer',
  OFFERS_DISMISSED: '1cc_dismissed_on_payment_offer',
};
