import { getEventsName } from './helper';

const rtbExperimentEvents = {
  EXPERIMENT_VARIANT: 'variant',
};

const events = {
  ...rtbExperimentEvents,
};

export default getEventsName('rtb_experiment', events);
