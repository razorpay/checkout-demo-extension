/**
 * Click on the CTA
 */
async function proceed(context) {
  if (!(await context.page.$('#user-details'))) {
    await context.page.click('#footer');
  }
}

module.exports = {
  proceed,
};
