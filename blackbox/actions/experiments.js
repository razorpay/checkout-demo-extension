const defaultExperiments = {
  home_2019: 0,
};

/**
 * Sets experiments in localStorage
 * @param {Page} page
 * @param {Object} experiments Overridden experiments
 */
async function setExperiments(page, experiments = {}) {
  const finalExperiments = {
    ...defaultExperiments,
    ...experiments,
  };

  await page.evaluate(experiments => {
    localStorage.setItem('rzp_checkout_exp', JSON.stringify(experiments));
  }, finalExperiments);
}

module.exports = {
  setExperiments,
};
