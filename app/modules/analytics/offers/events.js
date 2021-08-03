import { getEventsName } from '../helpers';

const offers = {
  APPLY: 'apply',
};

const events = {
  ...offers,
};

export default getEventsName('offer', events);
