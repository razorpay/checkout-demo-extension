/**
 * Experiment format:
 * {
 *    name: 'string',
 *    evaluator: function that returns a segment
 * }
 */

const VERNACULAR_DEFAULT_SELECTION = {
  name: 'vernacular_default_selection',
  evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};

export default [VERNACULAR_DEFAULT_SELECTION];
