class CheckoutTestRunner {
  constructor() {
    this.globalFeatureList = [
      'callbackUrl',
      'downtimeLow',
      'downtimeHigh',
      'feeBearer',
      'offers',
      'optionalContact',
      'partialPayment',
    ];
    this.featuresToBeTested = [];
    this.exemptedFeatureCombinations = [];
    this.maxCombinationDepth = 2;
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
    tests.forEach(test => {
      const old_combs = [...combs];

      old_combs.forEach(comb => {
        if (comb.length < this.maxCombinationDepth) {
          let newComb = [...comb, test].sort(this._sortingFunction);
          if (
            exempted.find(
              combToBeBarred => combToBeBarred + '' === newComb + ''
            ) == undefined
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
    this.exemptedFeatureCombinations = combinations.map(comb =>
      comb.sort(this._sortingFunction)
    );
    return this._createTestCombs();
  }

  /**
   * Used to run all valid test combinations
   * @param {Object} paymentMethodTestMaker takes a payment method test creation object on which tests are to be run
   */
  runOn(paymentMethodTestMaker) {
    let runnables = this.allRunnableCombinations.map(comb =>
      comb.reduce((acc, cV) => {
        acc[cV] = true;
        return acc;
      }, {})
    );
    if (this.targetFeature) {
      runnables = runnables.filter(runnable => runnable[this.targetFeature]);
    }
    runnables.forEach(runnable => {
      paymentMethodTestMaker(runnable);
    });
    return this;
  }
}

module.exports = new CheckoutTestRunner();
