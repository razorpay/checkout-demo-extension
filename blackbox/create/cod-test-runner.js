class CodTestRunner {
  constructor() {
    this.globalFeatureList = ['shippingFee', 'codFee', 'couponValid'];
    this.featuresToBeTested = [];
    this.exemptedFeatureCombinations = [];
    this.maxCombinationDepth = 3;
    this.allRunnableCombinations = [[]];
    this.targetFeature = null;
  }

  _sortingFunction(x, y) {
    return x > y ? 1 : -1;
  }

  _createTestCombs() {
    let exempted = this.exemptedFeatureCombinations;
    let tests = this.featuresToBeTested;
    let combs = [[]];
    tests.forEach((test) => {
      const oldCombs = [...combs];

      oldCombs.forEach((comb) => {
        if (comb.length < this.maxCombinationDepth) {
          let newComb = [...comb, test].sort(this._sortingFunction);
          if (
            !exempted.some(
              (combToBeBarred) => combToBeBarred + '' === newComb + ''
            )
          ) {
            combs.push(newComb);
          }
        }
      });
    });
    this.allRunnableCombinations = combs;
    return this;
  }

  /**
   * Used to set the list of features to be tests for any payment method
   * @param {Array} listOfFeatures the list of features that the test runner instance will target
   */
  setTestFeatures(listOfFeatures) {
    this.featuresToBeTested = listOfFeatures.sort(this._sortingFunction);
    return this._createTestCombs();
  }

  /**
   * @description setting a target feature for the instance makes it run only those test combinations which include that feature
   * @param {String} targetFeature name of the feature that is supposed to be checked
   */
  setTargetFeature(targetFeature) {
    this.targetFeature = targetFeature;
    return this;
  }

  /**
   * Used to prevent some test combinations from running
   * @param {Array} combinations All combinations which are to be exempted from running in the tests
   */
  setExemptedTestCombinations(combinations) {
    this.exemptedFeatureCombinations = combinations.map((comb) =>
      comb.sort(this._sortingFunction)
    );
    return this._createTestCombs();
  }

  /**
   * Used to run all valid test combinations
   * @param {Object} paymentMethodTestMaker takes a payment method test creation object on which tests are to be run
   */
  runOn(paymentMethodTestMaker, overrides = {}) {
    let runnables = this.allRunnableCombinations.map((comb) =>
      comb.reduce((acc, cV) => {
        acc[cV] = true;
        return acc;
      }, {})
    );
    if (this.targetFeature) {
      runnables = runnables.filter((runnable) => runnable[this.targetFeature]);
    }
    runnables.forEach((runnable) => {
      paymentMethodTestMaker({ ...runnable, ...overrides });
    });
    return this;
  }

  /**
   * @param {Number} depth The max number of features included in a test
   * @example setMaxCombinationDepth(3)
   */
  setMaxCombinationDepth(depth) {
    this.maxCombinationDepth = depth;
    return this._createTestCombs();
  }
}

module.exports = new CodTestRunner();