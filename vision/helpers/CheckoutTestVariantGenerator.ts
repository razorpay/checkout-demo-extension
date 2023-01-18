/** generate variant test cases */
class CheckoutTestVariantGenerator {
  globalFeatureList: string[];
  allRunnableCombinations: Array<any[]>;
  maxCombinationDepth: number;
  featuresToBeTested: string[];
  exemptedFeatureCombinations: string[];
  constructor() {
    this.globalFeatureList = [
      'callbackUrl',
      'downtimeLow',
      'downtimeHigh',
      'fee',
      'offers',
      'forcedOffer',
      'optionalContact',
      'partialPayment',
    ];
    this.featuresToBeTested = [];
    this.exemptedFeatureCombinations = [];
    this.maxCombinationDepth = 2;
    this.allRunnableCombinations = [[]];
  }

  _sortingFunction(x, y) {
    return x > y ? 1 : -1;
  }

  _createTestCombs() {
    let exempted = this.exemptedFeatureCombinations;
    let tests = this.featuresToBeTested;
    let combs: Array<string[]> = [[]];
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
  get(
    baseTestsArray: Array<{ title: string } & Record<string, any>> = [],
    overrides = {}
  ) {
    let runnables: Array<Record<string, boolean>> =
      this.allRunnableCombinations.map((comb) =>
        comb.reduce((acc, cV) => {
          acc[cV] = true;
          return acc;
        }, {})
      );
    const returnData: Record<string, any> = [];
    baseTestsArray.forEach((baseTest) => {
      returnData.push(
        ...runnables.map((runnable) => ({
          ...baseTest,
          title: `${baseTest.title} - ${JSON.stringify(runnable)}`,
          ...runnable,
          ...overrides,
        }))
      );
    });
    return returnData;
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

export default new CheckoutTestVariantGenerator();
