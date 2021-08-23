import CurrentExperiments from './current';
import BrowserStorage from 'browserstorage';
export { isCardsSeparationExperimentEnabled } from './all/cards-separation';

const STORAGE_KEY = 'rzp_checkout_exp';

/**
 * Retrieves all experiments from storage.
 *
 * @returns {Object}
 */
export function getExperimentsFromStorage() {
  let data;

  try {
    data = BrowserStorage.getItem(STORAGE_KEY) |> _Obj.parse;
  } catch (err) {}

  // Make sure we return an object
  if (_.isNonNullObject(data) && !_.isArray(data)) {
    return data;
  } else {
    return {};
  }
}

/**
 * Sets all experiments in storage.
 * @param {Object} experiments All experiments
 */
function setExperimentsInStorage(experiments) {
  if (_.isNonNullObject(experiments)) {
    try {
      experiments = _Obj.stringify(experiments);
      BrowserStorage.setItem(STORAGE_KEY, experiments);
    } catch (err) {
      return;
    }
  }
}

/**
 * Retrieves segment for a given experiment.
 * @param {string} experiment Experiment name
 *
 * @returns {*}
 */
function getSegment(experiment) {
  const experiments = getExperimentsFromStorage();

  return experiments[experiment];
}

/**
 * Creates a segment for the given experiment.
 * @param {string} experiment Experiment name
 * @param {*} evaluatorArg Argument for evaluator fn
 * @param {Function} overrideFn Function to override evaluation
 *
 * @returns {*}
 */
function setSegment(experiment, evaluatorArg, overrideFn) {
  const config = _Arr.find(CurrentExperiments, (ex) => ex.name === experiment);

  // Sanity check
  if (!config) {
    return;
  }

  // Determine what function to use to get the segment
  const evaluator = _.isFunction(overrideFn) ? overrideFn : config.evaluator;

  // Get segment
  const segment = evaluator(evaluatorArg);

  // Set in storage
  const all = getExperimentsFromStorage();
  all[config.name] = segment;
  setExperimentsInStorage(all);

  return segment;
}

/**
 * Retrieves segment for an experiment
 * or creates one if it doesn't exist.
 * @param {string} experiment Experiment name
 * @param {*} [evaluatorArg] Argument for evaluator fn
 * @param {Function} [overrideFn] Function to override evaluation
 *
 * @returns {*}
 */
export function getSegmentOrCreate(experiment, evaluatorArg, overrideFn) {
  const existing = getSegment(experiment);

  if (_.isUndefined(existing)) {
    return setSegment(experiment, evaluatorArg, overrideFn);
  } else {
    return existing;
  }
}

/**
 * Clears experiments that are not being used anymore.
 */
export function clearOldExperiments() {
  const all = getExperimentsFromStorage();
  const current = _Arr.map(CurrentExperiments, (ex) => ex.name);

  _Obj.loop(all, (segment, name) => {
    if (!_Arr.contains(current, name)) {
      delete all[name];
    }
  });

  setExperimentsInStorage(all);
}
