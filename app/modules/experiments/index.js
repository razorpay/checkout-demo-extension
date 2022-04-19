import BrowserStorage from 'browserstorage';

/** Don't change below */
const STORAGE_KEY = 'rzp_checkout_exp';

class Experiment {
  /**
   * Sets all experiments in storage.
   * @param {Object} experiments All experiments
   */
  static setExperimentsInStorage(experiments) {
    if (experiments && typeof experiments === 'object') {
      try {
        experiments = JSON.stringify(experiments);
        BrowserStorage.setItem(STORAGE_KEY, experiments);
      } catch (err) {
        console.error(err);
        return;
      }
    }
  }

  /**
   * Retrieves all experiments from storage.
   *
   * @returns {Object}
   */
  static getExperimentsFromStorage() {
    let data;

    try {
      data = JSON.parse(BrowserStorage.getItem(STORAGE_KEY));
    } catch (err) {
      // JSON parse Error
    }

    // Make sure we return an object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    } else {
      return {};
    }
  }

  constructor(experiments = {}) {
    this.experiments = experiments;
  }

  getExperiment = (name) => {
    if (!name) return null;
    return this.experiments[name];
  };

  getAllActiveExperimentsName = () => {
    return Object.keys(this.experiments);
  };

  /**
   * Creates a segment for the given experiment.
   * @param {string} experiment Experiment name
   * @param {*} evaluatorArg Argument for evaluator fn
   * @param {Function} overrideFn Function to override evaluation
   *
   * @returns {*}
   */
  setSegment(experiment, evaluatorArg, overrideFn) {
    const config = this.getExperiment(experiment);

    // Sanity check
    if (!config) {
      return;
    }

    // Determine what function to use to get the segment
    const evaluator =
      typeof overrideFn === 'function' ? overrideFn : config.evaluator;

    // Get segment
    const segment = evaluator(evaluatorArg);

    // Set in storage
    const all = Experiment.getExperimentsFromStorage();
    all[config.name] = segment;
    Experiment.setExperimentsInStorage(all);

    return segment;
  }

  /**
   * Retrieves segment for a given experiment.
   * @param {string} experiment Experiment name
   *
   * @returns {*}
   */
  getSegment(experiment) {
    const experiments = Experiment.getExperimentsFromStorage();

    return experiments[experiment];
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
  getSegmentOrCreate(experiment, evaluatorArg, overrideFn) {
    const existing = this.getSegment(experiment);

    /**
     * overrideFn will override the experiment value despite of old value
     */
    if (typeof overrideFn === 'function') {
      return overrideFn(evaluatorArg);
    }

    if (typeof existing === 'undefined') {
      return this.setSegment(experiment, evaluatorArg, overrideFn);
    } else {
      return existing;
    }
  }

  /**
   * Clears experiments that are not being used anymore.
   */
  clearOldExperiments = () => {
    const all = Experiment.getExperimentsFromStorage();
    const current = this.getAllActiveExperimentsName();

    const updatedExp = current.reduce((acc, currentExp) => {
      if (typeof all[currentExp] !== 'undefined') {
        acc[currentExp] = all[currentExp];
      }
      return acc;
    }, {});
    Experiment.setExperimentsInStorage(updatedExp);
  };

  /**
   * @typedef CreateExperimentOptions
   * @param {*} evaluatorArg Argument for evaluator fn
   * @param {Function} overrideFn Function to override evaluation
   */
  /**
   * @typedef SingleExperiment
   * @param {String} name Name of experiment
   * @param {Function} enabled Function to check experiment is enabled or not
   * @param {Function} evaluator evaluator function which dev passed during creation of experiment.
   */
  /**
   *
   * @param {String} name
   * @param {Function|number} evaluator returns 0 or 1
   * @param {CreateExperimentOptions} options
   * @returns {SingleExperiment}
   */
  create = (name, evaluator, options = {}) => {
    const { evaluatorArg, overrideFn } = options;

    function checkEnabled() {
      return this.getSegmentOrCreate(name, evaluatorArg, overrideFn) === 1;
    }
    let evaluatorFn = evaluator;
    if (typeof evaluator === 'number') {
      /**
       * evaluator >= 1 means exp is disable
       */
      evaluatorFn = () => (Math.random() < evaluator ? 0 : 1);
    }

    if (typeof evaluatorFn !== 'function') {
      throw new Error('evaluatorFn must be a function or number');
    }

    const singleExperiment = {
      name,
      enabled: checkEnabled.bind(this),
      evaluator: evaluatorFn,
    };

    this.register({ [name]: singleExperiment });

    return singleExperiment;
  };

  register(experimentsObject) {
    this.experiments = { ...this.experiments, ...experimentsObject };
  }
}

const experimentModule = new Experiment({});
const createExperiment = experimentModule.create;
const clearOldExperiments = experimentModule.clearOldExperiments;
const getExperimentsFromStorage = Experiment.getExperimentsFromStorage;

export { createExperiment, getExperimentsFromStorage, clearOldExperiments };
