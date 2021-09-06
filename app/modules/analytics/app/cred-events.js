import { getEventsName } from '../helpers';

/**
 * Since CRED related events are already in usage and cannot be changed to app:event_name
 * this file handles cred specific events.
 */
// All card related events
const events = {
  ELIGIBILITY_CHECK: 'eligibility_check',
  SUBTEXT_OFFER_EXPERIMENT: 'subtext_offer_experiment',
  EXPERIMENT_OFFER_SELECTED: 'experiment_offer_selected',
};

export default getEventsName('cred', events);
