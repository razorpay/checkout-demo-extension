import { EXPERIMENT_NAME as UPI_SUBTEXT_EXPERIMENT_NAME } from './all/upiSubtext';
import { EXPERIMENT_NAME as HIGHLIGHT_UPI_INTENT_INSTRUMENTS_EXPERIMENT_NAME } from './all/highlightUpiIntentInstrumentOnDesktop';
/**
 * Experiment format:
 * {
 *    name: 'string',
 *    evaluator: function that returns a segment
 * }
 */
const UPI_SUBTEXT_EXPERIMENT = {
    name: UPI_SUBTEXT_EXPERIMENT_NAME,
    evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};

const HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP = {
    name: HIGHLIGHT_UPI_INTENT_INSTRUMENTS_EXPERIMENT_NAME,
    evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};

export default [UPI_SUBTEXT_EXPERIMENT, HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP];