import BrowserStorage from 'browserstorage';

/** Don't change below */
const STORAGE_KEY = 'rzp_checkout_exp';

type CreateExperimentOptions = {
  /**
   * Argument for evaluator fn
   */
  evaluatorArg: number | string;

  /**
   * Function to override evaluation
   */
  overrideFn: Function;
};

type SingleExperiment = {
  /**
   * Name of experiment
   */
  name: string;
  /**
   * Function to check experiment is enabled or not
   */
  enabled: () => boolean;
  /**
   * Evaluator function which dev passed during creation of experiment.
   */
  evaluator?: Function;
};

class Experiment {
  /**
   * Sets all experiments in storage.
   * @param {Object} experiments All experiments
   */
  static setExperimentsInStorage(experiments: object) {
    if (experiments && typeof experiments === 'object') {
      try {
        BrowserStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
      } catch (err) {
        console.error(err);
        return;
      }
    }
  }

  /**
   * Retrieves all experiments from storage.
   *
   * @returns {object}
   */
  static getExperimentsFromStorage(): Common.Object {
    let data;

    try {
      data = JSON.parse(BrowserStorage.getItem(STORAGE_KEY) as string);
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

  /**
   * this parameter is class member
   */
  experiments: {
    [key: string]: SingleExperiment;
  };
  constructor(experiments = {}) {
    this.experiments = experiments;
  }

  getExperiment = (name: string) => {
    if (!name) {
      return null;
    }
    return this.experiments[name];
  };

  getAllActiveExperimentsName = () => {
    return Object.keys(this.experiments);
  };

  /**
   * Creates a segment for the given experiment.
   * @param {string} experiment Experiment name
   * @param {CreateExperimentOptions['evaluatorArg']} evaluatorArg Argument for evaluator fn
   * @param {CreateExperimentOptions['overrideFn']} overrideFn Function to override evaluation
   *
   * @returns {*}
   */
  setSegment(
    experiment: string,
    evaluatorArg: CreateExperimentOptions['evaluatorArg'],
    overrideFn: CreateExperimentOptions['overrideFn']
  ): any {
    const config = this.getExperiment(experiment);

    // Sanity check
    if (!config) {
      return;
    }

    // Determine what function to use to get the segment
    const evaluator =
      typeof overrideFn === 'function'
        ? overrideFn
        : (config.evaluator as Function);

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
  getSegment(experiment: string): any {
    const experiments = Experiment.getExperimentsFromStorage();

    return experiments[experiment];
  }

  /**
   * Retrieves segment for an experiment
   * or creates one if it doesn't exist.
   * @param {string} experiment Experiment name
   * @param {CreateExperimentOptions['evaluatorArg']} [evaluatorArg] Argument for evaluator fn
   * @param {CreateExperimentOptions['overrideFn']} [overrideFn] Function to override evaluation
   *
   * @returns {*}
   */
  getSegmentOrCreate(
    experiment: string,
    evaluatorArg: CreateExperimentOptions['evaluatorArg'],
    overrideFn: CreateExperimentOptions['overrideFn']
  ): number {
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

    const updatedExp = current.reduce((acc: Common.Object, currentExp) => {
      if (typeof all[currentExp] !== 'undefined') {
        acc[currentExp] = all[currentExp];
      }
      return acc;
    }, {});
    Experiment.setExperimentsInStorage(updatedExp);
  };

  /**
   *
   * @param {String} name
   * @param {Function|number} evaluator returns 0 or 1
   * @param {CreateExperimentOptions} options
   * @returns {SingleExperiment}
   */
  create = (
    name: string,
    evaluator: Function,
    options: CreateExperimentOptions = {} as CreateExperimentOptions
  ): SingleExperiment => {
    const { evaluatorArg, overrideFn } = options;

    function checkEnabled() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  register(experimentsObject: Common.Object<SingleExperiment>) {
    this.experiments = { ...this.experiments, ...experimentsObject };
  }
}

const experimentModule = new Experiment({});
const createExperiment = experimentModule.create;
const clearOldExperiments = experimentModule.clearOldExperiments;
const getExperimentsFromStorage = () => Experiment.getExperimentsFromStorage();

export { createExperiment, getExperimentsFromStorage, clearOldExperiments };
