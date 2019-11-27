import CurrentExperiments from './current';

const STORAGE_KEY = 'rzp_checkout_exp';

/**
 * Retrieves all experiments from storage.
 *
 * @returns {Object}
 */
export function getExperimentsFromStorage() {
  let data;

  try {
    data = global.localStorage.getItem(STORAGE_KEY) |> _Obj.parse;
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
  if (_.isObject) {
    try {
      experiments = _Obj.stringify(experiments);
      global.localStorage.setItem(STORAGE_KEY, experiments);
    } catch (err) {
      return;
    }
  }
}

/**
 * Retrieves segment for a given experiment.
 * @param {string} experiment Experiment name
 *
 * @returns {x}
 */
function getSegment(experiment) {
  const experiments = getExperimentsFromStorage();

  return experiments[experiment];
}

/**
 * Creates a segment for the given experiment.
 * @param {string} experiment Experiment name
 * @param {Object} evaluatorArgs Argments for evaluator fn
 * @param {Function} overrideFn Function to override evaluation
 *
 * @returns {*}
 */
function setSegment(experiment, evaluatorArgs, overrideFn) {
  const config = _Arr.find(CurrentExperiments, ex => ex.name === experiment);

  // Sanity check
  if (!config) {
    return;
  }

  // Determine what function to use to get the segment
  const evaluator = _.isFunction(overrideFn) ? overrideFn : config.evaluator;

  // Get segment
  const segment = evaluator(evaluatorArgs);

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
 * @param {Object} evaluatorArgs Argments for evaluator fn
 * @param {Function} overrideFn Function to override evaluation
 *
 * @returns {*}
 */
export function getSegmentOrCreate(experiment, evaluatorArgs, overrideFn) {
  const existing = getSegment(experiment);

  if (_.isUndefined(existing)) {
    return setSegment(experiment, evaluatorArgs, overrideFn);
  } else {
    return existing;
  }
}

/**
 * Clears experiments that are not being used anymore.
 */
export function clearOldExperiments() {
  const all = getExperimentsFromStorage();
  const current = _Arr.map(CurrentExperiments, ex => ex.name);

  _Obj.loop(all, (segment, name) => {
    if (!_Arr.contains(current, name)) {
      delete all[name];
    }
  });

  setExperimentsInStorage(all);
}
