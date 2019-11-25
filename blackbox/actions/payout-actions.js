const accountNum = '1112220014911928';
const ifscCode = 'ICIC0001343';
const accountHolderName = 'Sakshi Jain';
const bankName = 'ICICI Bank';

async function verifyPayoutInstruments(context) {
  const Instrument = await context.page.$x(
    '//div[contains(@class, "radio-option")]//div[contains(@class,"instrument-name")]'
  );
  const vpaInstrument = Instrument[0];
  const vpaInstrumentName = await context.page.evaluate(
    vpaInstrument => vpaInstrument.textContent,
    vpaInstrument
  );
  expect(vpaInstrumentName).toEqual(
    context.preferences.contact.fund_accounts[0].vpa.address
  );
  const acountInstrument = Instrument[1];
  const acountInstrumentName = await context.page.evaluate(
    acountInstrument => acountInstrument.textContent,
    acountInstrument
  );
  expect(acountInstrumentName).toEqual(
    'A/c No. ' +
      context.preferences.contact.fund_accounts[1].bank_account.account_number
  );
  // expect(vpaInstrumentName).toEqual(context.preferences.contact.fund_accounts[1].vpa.address);//option radio-option
}

async function selectInstrument(context, instrumentNumber) {
  const Instrument = await context.page.$x(
    '//div[contains(@class, "radio-option")]//div[contains(@class,"instrument-name")]'
  );
  await Instrument[instrumentNumber - 1].click();
}

async function addInstrument(context, vpaOrBank) {
  const Instrument = await context.page.$x(
    '//div[contains(@class, "instrument-add")]'
  );
  switch (vpaOrBank) {
    case 'VPA':
      await Instrument[0].click();
      break;
    case 'Bank':
      await Instrument[1].click();
      break;
    default:
      break;
  }
}

async function respondToFundAccountsRequest(context, upiIdOrBank) {
  const request = await context.expectRequest();
  expect(request.method).toEqual('POST');
  expect(request.url).toContain('fund_accounts/public?key_id=');
  if (upiIdOrBank != 'Bank') {
    const UPI = upiIdOrBank + '@upi';
    await context.respondJSON({
      id: 'fa_DkRsNMXJ95i4Sf',
      account_type: 'vpa',
      vpa: { address: UPI },
    });
  } else if (upiIdOrBank == 'Bank')
    await context.respondJSON({
      id: 'fa_DkSvNzU47AqV5h',
      account_type: 'bank_account',
      bank_account: {
        ifsc: ifscCode,
        bank_name: 'ICICI Bank',
        name: accountHolderName,
        notes: [],
        account_number: accountNum,
      },
    });
}

async function enterBankAccountDetails(context) {
  await context.page.type('#account_number', accountNum);
  await context.page.type('#account_number_confirm', accountNum);
  await context.page.type('#ifsc', ifscCode);
  await context.page.type('#name', accountHolderName);
}

module.exports = {
  verifyPayoutInstruments,
  selectInstrument,
  addInstrument,
  respondToFundAccountsRequest,
  enterBankAccountDetails,
};
