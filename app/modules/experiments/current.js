import { EXPERIMENT_NAME as UPI_SUBTEXT_EXPERIMENT_NAME } from './all/upiSubtext';
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

export default [UPI_SUBTEXT_EXPERIMENT];
