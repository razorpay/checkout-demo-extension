import { createExperiment } from 'experiments';

/**
 * Experiment: Show custom instruments in preferred methods
 * Current Value: 20%
 */
const customPreferredMethodsExperiment = createExperiment(
  'custom_preferred_methods',
  0.8
);

export { customPreferredMethodsExperiment };
