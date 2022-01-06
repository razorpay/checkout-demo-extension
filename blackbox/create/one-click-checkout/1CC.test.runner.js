function testRunner(testMaker, testFeatures) {
  testFeatures.forEach((feature) => {
    testMaker(feature);
  });
}

module.exports = {
  testRunner,
};
