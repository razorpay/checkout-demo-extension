/**
 * Click on the CTA
 */
async function proceed(context) {
  const proceed = await context.page.waitForSelector('#footer', {
    visible: true,
  });
  await proceed.click();
}

module.exports = {
  proceed,
};
