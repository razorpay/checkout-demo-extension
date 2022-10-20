const { delay } = require('../../util');
const { handlePartialOrderUpdate } = require('./order');

async function handleFillUserDetails(context, contact, email) {
  await context.page.waitForSelector('.details-container');
  await context.page.type('#overlay #contact', contact);
  await context.page.focus('#overlay #email');
  await handlePartialOrderUpdate(context);
  await context.page.type('#overlay #email', email);
  await context.page.focus('#overlay #contact');
  await handlePartialOrderUpdate(context);
  await delay(200);
  await context.page.click('.button.details-verify-button');
}

module.exports = {
  handleFillUserDetails,
};
