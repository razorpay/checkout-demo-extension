/**
 * Experiment format:
 * {
 *    name: 'string',
 *    evaluator: function that returns a segment
 * }
 */

/**
 * Homescreen 2019 Experiment
 * Segments:
 *  - 0: Old homescreen
 *  - 1: New homescreen
 */
const HOMESCREEN_2019 = {
  name: 'home_2019',
  evaluator: () => (Math.random() >= 0.5 ? 0 : 1),
};

export default [HOMESCREEN_2019];
