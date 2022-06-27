import { createExperiment } from 'experiments';

/**
 * Experiment: Show custom instruments in preferred methods
 * Current Value: 100%
 * ToDo: Remove post monitoring
 */
const customPreferredMethodsExperiment = createExperiment(
  'custom_preferred_methods_100',
  0
);

export { customPreferredMethodsExperiment };
