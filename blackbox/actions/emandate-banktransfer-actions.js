const { unflatten, query2obj } = require('../util');

const accountNum = '1112220014911928';
const ifscCode = 'RAZR0000001';
const accountHolderName = 'Sakshi Jain';

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
  await context.page.waitFor('#emandate-options > .auth-option.netbanking', {
    timeout: 2000,
    visible: true,
  });
  const netbanking = await context.page.waitForSelector(
    '#emandate-options > .auth-option'
  );
  await netbanking.click();
}

async function fillEmandateBankDetails(context) {
  await context.page.type('[name="bank_account[account_number]"]', accountNum);
  await context.page.type('[name="bank_account[ifsc]"]', ifscCode);
  await context.page.type('[name="bank_account[name]"]', 'Sakshi Jain');
  await context.page.select('[name="bank_account[account_type]"]', 'savings');
}

async function returnVirtualAccounts(context, fee = false) {
  const request = await context.expectRequest();
  const parsedRequestBody = unflatten(query2obj(request.body));
  const customerDetails = {};
  if (context.state.contact) {
    customerDetails.contact = `+91${context.state.contact}`;
  }
  if (context.state.email) {
    customerDetails.email = context.state.email;
  }

  await context.respondJSON({
    id: 'va_DhhfICdHxgXszs',
    name: accountHolderName,
    entity: 'virtual_account',
    status: 'active',
    description: null,
    amount_expected: fee ? 202000 : 200000,
    notes: [],
    amount_paid: 0,
    customer_id: null,
    receivers: [
      {
        id: 'ba_DhhfIKkKi1oWyp',
        entity: 'bank_account',
        ifsc: ifscCode,
        bank_name: null,
        name: accountHolderName,
        notes: [],
        account_number: accountNum,
      },
    ],
    close_by: null,
    closed_at: null,
    created_at: 1574058924,
  });
  expect(parsedRequestBody.customer).toEqual(customerDetails);
}

async function verifyNeftDetails(context, feeBearer) {
  const messageDiv = await context.page.waitForSelector('.neft-details');
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  expect(messageText.trim()).toEqual(
    'Account: ' +
      accountNum +
      ' IFSC: ' +
      ifscCode +
      ' Beneficiary Name: ' +
      accountHolderName +
      ' Amount Expected: ' +
      (feeBearer ? '₹ 2,020 See Fee Breakup' : '₹ 2,000')
  );
}

async function verifyRoundOffAlertMessage(context) {
  const messageDiv = await context.page.waitForSelector(
    '#bottom .bottom:last-child'
  );
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  expect(messageText).toContain(
    'Do not round-off the amount. Transfer the exact amount for the payment'
  );
}

module.exports = {
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
};
