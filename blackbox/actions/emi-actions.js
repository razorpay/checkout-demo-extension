const { delay, visible } = require('../util');
const { readFileSync } = require('fs');
const { handleCardValidation } = require('./card-actions');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

async function verifyEMIPlansWithOffers(context, offerNumber) {
  // await delay(40000);
  await context.page.waitForSelector(
    '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
      1 +
      ')'
  );
  for (var i = 1; i <= offerNumber; i++) {
    const currentElement = await context.page.$eval(
      '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
        i +
        ')',
      visible
    );
    expect(currentElement).toEqual(true);
  }
}

async function selectEMIPlanWithOffer(context, offerNumber) {
  await context.page.waitForSelector(
    '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
      1 +
      ')'
  );
  await context.page.click(
    '.emi-plans-list .expandable-card.expandable-card--has-badge:nth-of-type(' +
      offerNumber +
      ')'
  );
}

async function verifyEMIPlansWithoutOffers(context, offerNumber) {
  await context.page.waitForSelector(
    '.emi-plans-list .expandable-card:nth-of-type(' + 1 + ')'
  );
  for (var i = 1; i <= offerNumber; i++) {
    const currentElement = await context.page.$eval(
      '.emi-plans-list .expandable-card:nth-of-type(' + i + ')',
      visible
    );
    expect(currentElement).toEqual(true);
  }
}

async function selectEMIPlanWithoutOffer(context, offerNumber) {
  await context.page.click(
    '.emi-plans-list .expandable-card:nth-of-type(' + offerNumber + ')'
  );
}

module.exports = {
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation: handleCardValidation,
};
