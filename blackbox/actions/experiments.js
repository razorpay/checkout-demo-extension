const defaultExperiments = {
  home_2019: 0,
  cards_separation: 0,
  delay_login_otp: 0,
  one_click_upi_intent: 0,
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

  await page.evaluate((experiments) => {
    localStorage.setItem('rzp_checkout_exp', JSON.stringify(experiments));
  }, finalExperiments);
}
/**
 * Get experiments from localStorage
 * @param {Page} page
 * @returns {Object} experiments Overridden experiments
 */
async function getExperiments(context) {
  const experiments = await page.evaluate(() => {
    localStorage.getItem('rzp_checkout_exp');
  });
  return experiments ? JSON.parse(experiments) : {};
}

module.exports = {
  setExperiments,
  getExperiments,
};
