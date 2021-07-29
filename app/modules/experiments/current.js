import { EXPERIMENT_NAME as CARDS_SEPARATION_EXPERIMENT_NAME } from './all/cards-separation';
import { EXPERIMENT_NAME as HIGHLIGHT_UPI_INTENT_INSTRUMENTS_EXPERIMENT_NAME } from './all/highlightUpiIntentInstrumentOnDesktop';
/**
 * Experiment format:
 * {
 *    name: 'string',
 *    evaluator: function that returns a segment
 * }
 */
const CARDS_SEPARATION_EXPERIMENT = {
  name: CARDS_SEPARATION_EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};
const HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP = {
  name: HIGHLIGHT_UPI_INTENT_INSTRUMENTS_EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};

export default [
  HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP,
  CARDS_SEPARATION_EXPERIMENT,
];
