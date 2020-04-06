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

  sortingFunction(x, y) {
    return x > y ? 1 : -1;
  }

  createTestCombs() {
    let exempted = this.exemptedFeatureCombinations;
    let tests = this.featuresToBeTested;
    let combs = [[]];
    tests.forEach(test => {
      const old_combs = [...combs];

      old_combs.forEach(comb => {
        if (comb.length < this.maxCombinationDepth) {
          let newComb = [...comb, test].sort(this.sortingFunction);
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

  setTestFeatures(listOfFeatures) {
    this.featuresToBeTested = listOfFeatures.sort(this.sortingFunction);
    return this.createTestCombs();
  }

  setTargetFeature(targetFeature) {
    this.targetFeature = targetFeature;
    return this;
  }

  setExemptedTestCombinations(combinations) {
    this.exemptedFeatureCombinations = combinations.map(comb =>
      comb.sort(this.sortingFunction)
    );
    return this.createTestCombs();
  }

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
