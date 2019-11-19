const { visible, randomContact, delay } = require('../util');

async function verifyEmandateBank(context) {
  const messageDiv = await context.page.waitForSelector(
    '#emandate-bank > .bank-name'
  );
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  expect(messageText).toEqual(context.preferences.order.bank + ' Bank');
}

async function selectEmandateNetbanking(context) {
  await context.page.waitFor('#emandate-options > .auth-option', {
    timeout: 2000,
    visible: true,
  });
  const netbanking = await context.page.waitForSelector(
    '#emandate-options > .auth-option'
  );
  await netbanking.click();
}

async function fillEmandateBankDetails(context) {
  await context.page.type(
    '[name="bank_account[account_number]"]',
    '1112220014911928'
  );
  await context.page.type('[name="bank_account[ifsc]"]', 'RAZR0000001');
  await context.page.type('[name="bank_account[name]"]', 'Sakshi Jain');
}

async function returnVirtualAccounts(context) {
  await context.expectRequest();
  await context.respondJSON({
    id: 'va_DhhfICdHxgXszs',
    name: 'Umang Galaiya',
    entity: 'virtual_account',
    status: 'active',
    description: null,
    amount_expected: 200000,
    notes: [],
    amount_paid: 0,
    customer_id: null,
    receivers: [
      {
        id: 'ba_DhhfIKkKi1oWyp',
        entity: 'bank_account',
        ifsc: 'RAZR0000001',
        bank_name: null,
        name: 'Umang Galaiya',
        notes: [],
        account_number: '1112220014911928',
      },
    ],
    close_by: null,
    closed_at: null,
    created_at: 1574058924,
  });
}

module.exports = {
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  returnVirtualAccounts,
};
